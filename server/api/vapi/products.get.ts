import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userQuery = typeof query.q === 'string' ? query.q : ''

    if (!userQuery) {
      // Return all products if no query
      const products = await prisma.products.findMany({
        take: 10,
        orderBy: [{ quantity: 'desc' }, { created_at: 'desc' }],
      })

      return {
        query: 'all products',
        results: formatProducts(products),
        summary: generateProductSummary(products, 'all available products'),
      }
    }

    console.log('Vapi product search:', userQuery)

    // Enhanced search for real product data
    const products = await searchProducts(userQuery)

    return {
      query: userQuery,
      results: formatProducts(products),
      summary: generateProductSummary(products, userQuery),
    }
  } catch (error) {
    console.error('Product search error:', error)
    throw createError({ statusCode: 500, message: 'Error searching products' })
  } finally {
    await prisma.$disconnect()
  }
})

async function searchProducts(query: string) {
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter((term) => term.length > 2)

  const where: any = {
    OR: [
      // Primary search - full query
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { genre: { contains: query, mode: 'insensitive' } },
    ],
  }

  // Add individual word searches for better matching
  searchTerms.forEach((term) => {
    where.OR.push(
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { genre: { contains: term, mode: 'insensitive' } }
    )
  })

  // Handle price queries
  const priceMatch = query.match(
    /under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|below\s*\$?(\d+)|cheap|budget|affordable/i
  )
  if (priceMatch) {
    const maxPrice = priceMatch[1] || priceMatch[2] || priceMatch[3]
    if (maxPrice) {
      where.price = { lte: parseInt(maxPrice) * 100 }
    } else {
      // For words like "cheap", "budget", set a reasonable max price
      where.price = { lte: 3000 } // $30
    }
  }

  const expensiveMatch = query.match(
    /over\s*\$?(\d+)|more\s*than\s*\$?(\d+)|above\s*\$?(\d+)|expensive|premium/i
  )
  if (expensiveMatch) {
    const minPrice = expensiveMatch[1] || expensiveMatch[2] || expensiveMatch[3]
    if (minPrice) {
      where.price = { gte: parseInt(minPrice) * 100 }
    } else {
      // For words like "expensive", "premium"
      where.price = { gte: 5000 } // $50
    }
  }

  // Handle availability queries
  if (query.match(/in\s*stock|available|have/i)) {
    where.quantity = { gt: 0 }
  }

  return await prisma.products.findMany({
    where,
    take: 10,
    orderBy: [
      { quantity: 'desc' }, // Prioritize items in stock
      { created_at: 'desc' },
    ],
  })
}

function formatProducts(products: any[]) {
  return products.map((product) => {
    // Try to extract artist and album from title
    const titleParts = product.title.split(' - ')
    let artist = 'Various Artists'
    let album = product.title

    if (titleParts.length >= 2) {
      artist = titleParts[0].trim()
      album = titleParts.slice(1).join(' - ').trim()
    } else {
      // Try other common separators
      const colonParts = product.title.split(':')
      if (colonParts.length >= 2) {
        artist = colonParts[0].trim()
        album = colonParts.slice(1).join(':').trim()
      }
    }

    return {
      id: product.id,
      title: product.title,
      artist,
      album,
      genre: product.genre || 'Unknown',
      price: product.price / 100,
      priceDisplay: `$${(product.price / 100).toFixed(2)}`,
      available: product.quantity > 0,
      inStock: product.quantity,
      description: product.description || 'No description available',
      imageUrl: product.url,
      condition: 'New', // Default since not in schema
      format: 'Vinyl LP', // Default since not in schema
    }
  })
}

function generateProductSummary(products: any[], originalQuery: string) {
  if (products.length === 0) {
    return {
      message: `I couldn't find any products matching "${originalQuery}". Try searching for specific artists, album titles, or genres.`,
      products: [],
      suggestions: [
        'Search by artist name',
        'Look for specific album titles',
        'Browse by genre (rock, jazz, pop, etc.)',
        "Ask about price ranges ('under $30', 'budget albums')",
        "Check what's in stock",
      ],
    }
  }

  const inStockCount = products.filter((p) => p.quantity > 0).length
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

  const formattedProducts = formatProducts(products)

  const priceRange = {
    min: Math.min(...formattedProducts.map((p) => p.price)),
    max: Math.max(...formattedProducts.map((p) => p.price)),
  }

  // Debug logging
  console.log(
    `Product summary: ${products.length} total, ${inStockCount} in stock, ${totalQuantity} total quantity`
  )
  formattedProducts.forEach((p) => {
    console.log(`- ${p.title}: ${p.inStock} in stock, available: ${p.available}`)
  })

  let priceMessage = ''
  if (products.length > 1) {
    priceMessage = `Prices range from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}.`
  } else if (products.length === 1) {
    priceMessage = `Price: $${priceRange.min.toFixed(2)}.`
  }

  const summary = {
    message: `Found ${products.length} product${products.length > 1 ? 's' : ''} for "${originalQuery}". ${inStockCount} in stock with ${totalQuantity} total items available. ${priceMessage}`,
    products: formattedProducts.map((product) => ({
      title: `${product.artist} - ${product.album}`,
      details: `${product.format} • ${product.condition} • ${product.genre}`,
      price: product.priceDisplay,
      availability: product.available ? `In Stock (${product.inStock} available)` : 'Out of Stock',
      description: product.description,
    })),
    suggestions: [
      "Ask about specific albums: 'Do you have [album name]?'",
      "Check prices: 'How much is [album]?'",
      "Browse by genre: 'Show me [genre] albums'",
      "Find deals: 'What's under $25?'",
      "Check availability: 'What's in stock?'",
    ],
  }

  return summary
}
