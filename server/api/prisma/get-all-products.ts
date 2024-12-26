import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    setResponseHeaders(event, {
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin': '*',
    })

    const products = await prisma.products.findMany()
    return products
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching products from database',
    })
  } finally {
    await prisma.$disconnect()
  }
})
