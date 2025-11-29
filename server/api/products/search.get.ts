import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    setResponseHeaders(event, {
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin': '*',
    })

    const query = getQuery(event)
    const q = typeof query.q === 'string' ? query.q : ''
    const genre = typeof query.genre === 'string' ? query.genre : undefined
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
    const limit = query.limit ? Math.min(Number(query.limit), 100) : 20
    const offset = query.offset ? Number(query.offset) : 0
    const sort = typeof query.sort === 'string' ? query.sort : 'created_at'
    const order =
      (typeof query.order === 'string' ? query.order : 'desc').toLowerCase() === 'asc'
        ? 'asc'
        : 'desc'

    const where: any = {}

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { genre: { contains: q, mode: 'insensitive' } },
        { url: { contains: q, mode: 'insensitive' } },
      ]

      const qNum = Number(q)
      if (!Number.isNaN(qNum)) {
        where.OR.push({ id: qNum })
        where.OR.push({ price: qNum })
      }
    }

    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' }
    }

    if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
      where.price = {}
      if (typeof minPrice === 'number') where.price.gte = minPrice
      if (typeof maxPrice === 'number') where.price.lte = maxPrice
    }

    const sortable: Record<string, boolean> = {
      id: true,
      title: true,
      genre: true,
      price: true,
      created_at: true,
    }

    const orderBy = sortable[sort] ? { [sort]: order } : { created_at: 'desc' as const }

    const [items, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.products.count({ where }),
    ])

    return { items, total, limit, offset }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({ statusCode: 500, message: 'Error searching products' })
  } finally {
    await prisma.$disconnect()
  }
})
