import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userQuery = typeof query.q === 'string' ? query.q : ''

    if (!userQuery) {
      return { error: 'No query provided' }
    }

    console.log('Assistant album query:', userQuery)

    // Search for albums based on the query
    const albums = await searchAlbumsByQuery(userQuery)

    return {
      query: userQuery,
      results: albums,
      summary: generateAlbumResponse(albums, userQuery),
    }
  } catch (error) {
    console.error('Assistant search error:', error)
    throw createError({ statusCode: 500, message: 'Error searching albums' })
  } finally {
    await prisma.$disconnect()
  }
})

async function searchAlbumsByQuery(query: string) {
  // Enhanced search logic for better matching
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter((term) => term.length > 2)

  const where: any = {
    OR: [
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
  const priceMatch = query.match(/under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|below\s*\$?(\d+)/i)
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) * 100
    where.price = { lte: maxPrice }
  }

  const overMatch = query.match(/over\s*\$?(\d+)|more\s*than\s*\$?(\d+)|above\s*\$?(\d+)/i)
  if (overMatch) {
    const minPrice = parseInt(overMatch[1] || overMatch[2] || overMatch[3]) * 100
    where.price = { gte: minPrice }
  }

  const albums = await prisma.products.findMany({
    where,
    take: 8,
    orderBy: [
      { quantity: 'desc' }, // Prioritize items in stock
      { created_at: 'desc' },
    ],
  })

  return albums.map((album) => {
    // Better parsing of title for artist/album separation
    const titleParts = album.title.split(' - ')
    const artist = titleParts.length > 1 ? titleParts[0] : extractArtistFromTitle(album.title)
    const albumName = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : album.title

    return {
      id: album.id,
      title: album.title,
      artist,
      album: albumName,
      genre: album.genre,
      price: album.price / 100,
      priceDisplay: `$${(album.price / 100).toFixed(2)}`,
      available: album.quantity > 0,
      inStock: album.quantity,
      description: album.description || 'No description available',
      condition: 'New',
      format: 'Vinyl LP',
      imageUrl: album.url,
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

function generateAlbumResponse(albums: any[], originalQuery: string) {
  if (albums.length === 0) {
    return {
      message: `I couldn't find any albums matching "${originalQuery}". Could you try searching for a specific artist, album title, or genre?`,
      suggestions: [
        'Try searching for a specific artist name',
        "Mention the album title you're looking for",
        "Specify a genre like 'rock', 'jazz', or 'pop'",
        "Include price range like 'under $30' or 'budget albums'",
        "Ask about availability: 'What's in stock?'",
      ],
    }
  }

  const inStockCount = albums.filter((album) => album.available).length
  const totalQuantity = albums.reduce((sum, album) => sum + album.inStock, 0)

  const summary: {
    message: string
    albums: any[]
    suggestions: string[]
  } = {
    message: `I found ${albums.length} album${albums.length > 1 ? 's' : ''} matching "${originalQuery}". ${inStockCount} ${inStockCount === 1 ? 'is' : 'are'} currently in stock with ${totalQuantity} total items available.`,
    albums: albums.map((album) => ({
      title: `${album.artist} - ${album.album}`,
      details: `${album.format} • ${album.condition} • ${album.genre}`,
      price: album.priceDisplay,
      availability: album.available ? `In Stock (${album.inStock} available)` : 'Out of Stock',
      description: album.description,
    })),
    suggestions: [],
  }

  if (albums.length > 0) {
    summary.suggestions = [
      "Ask about specific prices: 'How much is [album name]?'",
      "Check availability: 'Is [album] in stock?'",
      "Compare albums: 'What's the cheapest option?'",
      "Find by genre: 'Show me more [genre] albums'",
      "Ask about recommendations: 'What are your most popular albums?'",
    ]
  }

  return summary
}
