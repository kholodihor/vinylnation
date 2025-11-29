import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const res = await prisma.products.create({
    data: {
      title: body.title,
      genre: body.genre,
      url: body.url,
      description: body.description,
      price: body.price,
      quantity: body.quantity,
    },
  })

  return res
})
