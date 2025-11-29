import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    setResponseHeaders(event, {
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin': '*',
    })

    const query = await readBody(event)
    const userQuery = query?.query || query?.message || ''

    if (!userQuery) {
      return { error: 'No query provided' }
    }

    console.log('Vapi assistant query:', userQuery)

    // Search products directly with enhanced logic
    const results = await searchProducts(userQuery)

    return {
      query: userQuery,
      results,
      summary: generateResponseSummary(results, userQuery),
    }
  } catch (error) {
    console.error('Vapi search error:', error)
    throw createError({ statusCode: 500, message: 'Error searching albums' })
  } finally {
    await prisma.$disconnect()
  }
})

async function searchProducts(query: string) {
  console.log('Searching for:', query)

  // Build comprehensive search conditions
  const where: any = {
    OR: [
      // Primary search - exact phrase matching
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { genre: { contains: query, mode: 'insensitive' } },
    ],
  }

  // Add individual word searches for better matching
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter(
      (term) =>
        term.length > 2 &&
        ![
          'the',
          'a',
          'an',
          'and',
          'or',
          'but',
          'in',
          'on',
          'at',
          'to',
          'for',
          'of',
          'with',
          'by',
          'do',
          'you',
          'have',
          'any',
          'show',
          'me',
          'find',
          'search',
          'album',
          'albums',
          'record',
          'records',
          'vinyl',
          'music',
        ].includes(term)
    )

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
      where.price = { lte: 3000 } // $30 for "cheap" etc.
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
      where.price = { gte: 5000 } // $50 for "expensive" etc.
    }
  }

  // Handle availability queries
  if (query.match(/in\s*stock|available|have/i)) {
    where.quantity = { gt: 0 }
  }

  console.log('Search conditions:', JSON.stringify(where, null, 2))

  const products = await prisma.products.findMany({
    where,
    take: 10,
    orderBy: [
      { quantity: 'desc' }, // Prioritize items in stock
      { created_at: 'desc' },
    ],
  })

  console.log(`Found ${products.length} products`)

  return products.map((product) => {
    // Better parsing of title for artist/album separation
    const titleParts = product.title.split(' - ')
    const artist = titleParts.length > 1 ? titleParts[0] : extractArtistFromTitle(product.title)
    const albumName = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : product.title

    // Debug the availability calculation
    const isAvailable = product.quantity > 0
    console.log(
      `Product: ${product.title}, Quantity: ${product.quantity}, Available: ${isAvailable}`
    )

    return {
      id: product.id,
      title: product.title,
      artist: artist,
      album: albumName,
      genre: product.genre || 'Unknown',
      price: product.price / 100,
      priceDisplay: `$${(product.price / 100).toFixed(2)}`,
      available: isAvailable,
      inStock: product.quantity,
      description: product.description || 'No description available',
      imageUrl: product.url,
    }
  })
}

function extractArtistFromTitle(title: string): string {
  // Common patterns to extract artist names from titles
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/, // "Artist - Album"
    /^(.+?)\s*:\s*(.+)$/, // "Artist: Album"
    /^(.+?)\s*\|\s*(.+)$/, // "Artist | Album"
    /by\s+(.+?)(?:\s|$)/i, // "Album by Artist"
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // If no pattern matches, try to extract first few words as artist
  const words = title.split(' ')
  if (words.length > 3) {
    return words.slice(0, 2).join(' ')
  }

  return 'Various Artists'
}

function generateResponseSummary(results: any[], originalQuery: string) {
  if (results.length === 0) {
    return `I couldn't find any albums matching "${originalQuery}". Could you try rephrasing or provide more specific details about the artist, album, or genre you're looking for?`
  }

  const totalAlbums = results.length
  const inStockCount = results.filter((r) => r.available).length
  const totalQuantity = results.reduce((sum, r) => sum + r.inStock, 0)

  console.log(
    `Summary: ${totalAlbums} total, ${inStockCount} in stock, ${totalQuantity} total quantity`
  )

  const priceRange =
    results.length > 0
      ? {
          min: Math.min(...results.map((r) => r.price)),
          max: Math.max(...results.map((r) => r.price)),
        }
      : null

  let summary = `I found ${totalAlbums} album${totalAlbums > 1 ? 's' : ''} matching "${originalQuery}". `

  if (inStockCount > 0) {
    summary += `${inStockCount} ${inStockCount === 1 ? 'is' : 'are'} currently in stock with ${totalQuantity} total items available. `
  }

  if (priceRange) {
    summary += `Prices range from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}. `
  }

  if (results.length <= 3) {
    summary += 'Here they are:\n'
    results.forEach((album, index) => {
      const stockInfo = album.available ? `(${album.inStock} in stock)` : '(out of stock)'
      summary += `${index + 1}. "${album.album}" by ${album.artist} - ${album.priceDisplay} ${stockInfo}\n`
    })
  } else {
    summary += 'Here are the top matches:\n'
    results.slice(0, 3).forEach((album, index) => {
      const stockInfo = album.available ? `(${album.inStock} in stock)` : '(out of stock)'
      summary += `${index + 1}. "${album.album}" by ${album.artist} - ${album.priceDisplay} ${stockInfo}\n`
    })
    if (results.length > 3) {
      summary += `...and ${results.length - 3} more albums available.`
    }
  }

  return summary
}
