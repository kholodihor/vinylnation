import { PrismaClient } from '@prisma/client'
import { sendKafkaEvent } from '../../utils/kafka'

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

    const assistantTopic = process.env.KAFKA_ASSISTANT_TOPIC || 'assistant'

    await sendKafkaEvent(assistantTopic, null, {
      type: 'assistant.query',
      query: userQuery,
      timestamp: Date.now(),
    })

    // Search products with improved logic
    const results = await searchProductsImproved(userQuery)

    const response = {
      query: userQuery,
      results,
      summary: generateResponseSummary(results, userQuery),
    }

    await sendKafkaEvent(assistantTopic, null, {
      type: 'assistant.results',
      query: userQuery,
      resultCount: results.length,
      timestamp: Date.now(),
    })

    return response
  } catch (error) {
    console.error('Vapi search error:', error)
    throw createError({ statusCode: 500, message: 'Error searching albums' })
  } finally {
    await prisma.$disconnect()
  }
})

async function searchProductsImproved(query: string) {
  console.log('Searching for:', query)

  // Clean search terms - remove common words
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
          'studio',
          'studios',
        ].includes(term)
    )

  console.log('Search terms:', searchTerms)

  // Step 1: Try exact title matching first (highest priority)
  let products = await prisma.products.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
    },
    take: 10,
    orderBy: [{ quantity: 'desc' }, { created_at: 'desc' }],
  })

  console.log(`Exact title match found: ${products.length} products`)

  // Step 2: If no exact match, try individual search terms in title only
  if (products.length === 0 && searchTerms.length > 0) {
    const titleWhere: any = {
      OR: searchTerms.map((term) => ({
        title: { contains: term, mode: 'insensitive' },
      })),
    }

    products = await prisma.products.findMany({
      where: titleWhere,
      take: 10,
      orderBy: [{ quantity: 'desc' }, { created_at: 'desc' }],
    })

    console.log(`Title word match found: ${products.length} products`)
  }

  // Step 3: If still no matches, try genre matching
  if (products.length === 0 && searchTerms.length > 0) {
    const genreWhere: any = {
      OR: [
        { genre: { contains: query, mode: 'insensitive' } },
        ...searchTerms.map((term) => ({
          genre: { contains: term, mode: 'insensitive' },
        })),
      ],
    }

    products = await prisma.products.findMany({
      where: genreWhere,
      take: 10,
      orderBy: [{ quantity: 'desc' }, { created_at: 'desc' }],
    })

    console.log(`Genre match found: ${products.length} products`)
  }

  // Handle price queries
  const priceMatch = query.match(
    /under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|below\s*\$?(\d+)|cheap|budget|affordable/i
  )
  if (priceMatch && products.length === 0) {
    const maxPrice = priceMatch[1] || priceMatch[2] || priceMatch[3]
    const priceLimit = maxPrice ? parseInt(maxPrice) * 100 : 3000 // $30 for "cheap" etc.

    products = await prisma.products.findMany({
      where: { price: { lte: priceLimit } },
      take: 10,
      orderBy: [{ price: 'asc' }, { quantity: 'desc' }],
    })

    console.log(`Price filter found: ${products.length} products under $${priceLimit / 100}`)
  }

  // Handle availability queries
  if (query.match(/in\s*stock|available|what.*have/i) && products.length === 0) {
    products = await prisma.products.findMany({
      where: { quantity: { gt: 0 } },
      take: 10,
      orderBy: [{ quantity: 'desc' }, { created_at: 'desc' }],
    })

    console.log(`Stock query found: ${products.length} products in stock`)
  }

  console.log(`Final result: ${products.length} products`)

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
      artist,
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
    return `I couldn't find any albums matching "${originalQuery}". We currently have Pink Floyd, Depeche Mode, King Crimson, and Yes albums in stock. Could you try searching for one of these artists or ask about our available genres?`
  }

  const totalAlbums = results.length
  const inStockCount = results.filter((r) => r.available).length
  const totalQuantity = results.reduce((sum, r) => sum + r.inStock, 0)

  console.log(
    `Summary: ${totalAlbums} total, ${inStockCount} in stock, ${totalQuantity} total quantity`
  )

  const prices = results.map((r) => r.price)
  const priceRange =
    results.length > 0
      ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      }
      : null

  console.log('Price calculation debug:', { prices, priceRange })

  let summary = `I found ${totalAlbums} album${totalAlbums > 1 ? 's' : ''} matching "${originalQuery}". `

  if (inStockCount > 0) {
    summary += `${inStockCount} ${inStockCount === 1 ? 'is' : 'are'} currently in stock with ${totalQuantity} total items available. `
  }

  if (priceRange && results.length > 1) {
    summary += `Prices range from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}. `
  } else if (priceRange && results.length === 1) {
    summary += `Price: $${priceRange.min.toFixed(2)}. `
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
