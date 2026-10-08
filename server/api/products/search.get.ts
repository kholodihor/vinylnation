import type { Prisma } from '@prisma/client'

const SORTABLE = new Set(['id', 'title', 'genre', 'price', 'created_at'])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const genre = typeof query.genre === 'string' ? query.genre : undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const sort =
    typeof query.sort === 'string' && SORTABLE.has(query.sort) ? query.sort : 'created_at'
  const order = query.order === 'asc' ? 'asc' : 'desc'

  const where: Prisma.ProductsWhereInput = {}

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { genre: { contains: q, mode: 'insensitive' } },
    ]
    const qNum = Number(q)
    if (Number.isInteger(qNum)) {
      where.OR.push({ id: qNum }, { price: qNum })
    }
  }

  if (genre) {
    where.genre = { contains: genre, mode: 'insensitive' }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = { gte: minPrice, lte: maxPrice }
  }

  const [items, total] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy: { [sort]: order },
      take: limit,
      skip: offset,
    }),
    prisma.products.count({ where }),
  ])

  return { items, total, limit, offset }
})
