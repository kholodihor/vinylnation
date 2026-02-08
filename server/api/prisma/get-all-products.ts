import prisma from '~/server/lib/prisma'
import { cache } from '~/server/lib/cache'
import { performanceMonitor } from '~/server/lib/performance'

const CACHE_KEY = 'products:all'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default defineEventHandler(async (event) => {
  const endTimer = performanceMonitor.startApiTimer()

  try {
    // Check cache first
    const cached = cache.get(CACHE_KEY)
    if (cached) {
      performanceMonitor.recordCacheHit(true)
      setResponseHeaders(event, {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'HIT',
        'X-Response-Time': `${endTimer()}ms`,
      })
      return cached
    }

    performanceMonitor.recordCacheHit(false)
    const products = await prisma.products.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        genre: true,
        url: true,
        price: true,
        quantity: true,
        created_at: true,
      },
    })

    // Cache the result
    cache.set(CACHE_KEY, products, CACHE_TTL)

    const responseTime = endTimer()
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'MISS',
      'X-Response-Time': `${responseTime}ms`,
    })

    return products
  } catch (error) {
    console.error('Database error:', error)
    endTimer() // Record the time even for errors
    throw createError({
      statusCode: 500,
      message: 'Error fetching products from database',
    })
  }
})
