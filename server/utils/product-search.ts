import type { Prisma, Products } from '@prisma/client'

const STOP_WORDS = new Set([
  'the',
  'and',
  'but',
  'for',
  'with',
  'you',
  'have',
  'any',
  'show',
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
])

const MAX_PRICE_RE =
  /under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|below\s*\$?(\d+)|cheap|budget|affordable/i
const MIN_PRICE_RE = /over\s*\$?(\d+)|more\s*than\s*\$?(\d+)|above\s*\$?(\d+)|expensive|premium/i
const IN_STOCK_RE = /in\s*stock|available|what.*have/i

/** Default bounds (cents) for vague words like "cheap" / "premium" */
const CHEAP_MAX = 3000
const PREMIUM_MIN = 5000

export const DEFAULT_ORDER: Prisma.ProductsOrderByWithRelationInput[] = [
  { quantity: 'desc' },
  { created_at: 'desc' },
]

export function getSearchTerms(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term))
}

function matchPrice(query: string, re: RegExp, fallback: number) {
  const match = query.match(re)
  if (!match) return undefined
  const dollars = match[1] || match[2] || match[3]
  return dollars ? parseInt(dollars) * 100 : fallback
}

export function getPriceFilter(query: string): Prisma.IntFilter | undefined {
  const lte = matchPrice(query, MAX_PRICE_RE, CHEAP_MAX)
  const gte = matchPrice(query, MIN_PRICE_RE, PREMIUM_MIN)
  if (lte === undefined && gte === undefined) return undefined
  return { lte, gte }
}

export function isStockQuery(query: string) {
  return IN_STOCK_RE.test(query)
}

const textMatch = (value: string): Prisma.ProductsWhereInput[] => [
  { title: { contains: value, mode: 'insensitive' } },
  { description: { contains: value, mode: 'insensitive' } },
  { genre: { contains: value, mode: 'insensitive' } },
]

/** Broad search: full phrase or any meaningful word, plus price/stock filters */
export function buildSearchWhere(query: string): Prisma.ProductsWhereInput {
  const where: Prisma.ProductsWhereInput = {
    OR: [query, ...getSearchTerms(query)].flatMap(textMatch),
  }
  const price = getPriceFilter(query)
  if (price) where.price = price
  if (isStockQuery(query)) where.quantity = { gt: 0 }
  return where
}

function splitTitle(title: string) {
  const match = title.match(/^(.+?)\s*[-:|]\s*(.+)$/)
  if (match) return { artist: match[1].trim(), album: match[2].trim() }
  return { artist: 'Various Artists', album: title }
}

export function toAssistantProduct(product: Products) {
  const { artist, album } = splitTitle(product.title)
  return {
    id: product.id,
    title: product.title,
    artist,
    album,
    genre: product.genre || 'Unknown',
    price: product.price / 100,
    priceDisplay: formatUsd(product.price),
    available: product.quantity > 0,
    inStock: product.quantity,
    description: product.description || 'No description available',
    imageUrl: product.url,
    condition: 'New',
    format: 'Vinyl LP',
  }
}

export type AssistantProduct = ReturnType<typeof toAssistantProduct>

export function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

/** Plain-text summary suited for being read out by the voice assistant */
export function describeResults(results: AssistantProduct[], query: string) {
  if (!results.length) {
    return `I couldn't find any albums matching "${query}". Could you try a specific artist, album title, or genre?`
  }

  const inStock = results.filter((r) => r.available).length
  const totalUnits = results.reduce((sum, r) => sum + r.inStock, 0)
  const prices = results.map((r) => r.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const plural = results.length > 1

  let text = `I found ${results.length} album${plural ? 's' : ''} matching "${query}". `
  if (inStock > 0) {
    text += `${inStock} ${inStock === 1 ? 'is' : 'are'} currently in stock with ${totalUnits} total items available. `
  }
  text += plural
    ? `Prices range from $${min.toFixed(2)} to $${max.toFixed(2)}. `
    : `Price: $${min.toFixed(2)}. `

  text += results.length <= 3 ? 'Here they are:\n' : 'Here are the top matches:\n'
  results.slice(0, 3).forEach((album, i) => {
    const stock = album.available ? `(${album.inStock} in stock)` : '(out of stock)'
    text += `${i + 1}. "${album.album}" by ${album.artist} - ${album.priceDisplay} ${stock}\n`
  })
  if (results.length > 3) {
    text += `...and ${results.length - 3} more albums available.`
  }
  return text
}

/** Structured summary rendered by the assistant demo page */
export function summarizeResults(results: AssistantProduct[], query: string) {
  if (!results.length) {
    return {
      message: describeResults(results, query),
      albums: [],
      suggestions: [
        'Search by artist name',
        'Look for specific album titles',
        'Browse by genre (rock, jazz, pop, etc.)',
        "Ask about price ranges ('under $30', 'budget albums')",
        "Check what's in stock",
      ],
    }
  }

  return {
    message: describeResults(results, query),
    albums: results.map((p) => ({
      title: `${p.artist} - ${p.album}`,
      details: `${p.format} • ${p.condition} • ${p.genre}`,
      price: p.priceDisplay,
      availability: p.available ? `In Stock (${p.inStock} available)` : 'Out of Stock',
      description: p.description,
    })),
    suggestions: [
      "Ask about specific albums: 'Do you have [album name]?'",
      "Check prices: 'How much is [album]?'",
      "Browse by genre: 'Show me [genre] albums'",
      "Find deals: 'What's under $25?'",
      "Check availability: 'What's in stock?'",
    ],
  }
}
