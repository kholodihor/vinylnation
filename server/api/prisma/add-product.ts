import { PrismaClient } from '@prisma/client'
import { sendKafkaEvent } from '../../utils/kafka'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const product = await prisma.products.create({
    data: {
      title: body.title,
      genre: body.genre,
      url: body.url,
      description: body.description,
      price: body.price,
      quantity: body.quantity,
    },
  })

  const topic = process.env.KAFKA_INVENTORY_TOPIC || 'inventory'

  await sendKafkaEvent(topic, String(product.id), {
    type: 'inventory.created',
    id: product.id,
    title: product.title,
    genre: product.genre,
    quantity: product.quantity,
    price: product.price,
    url: product.url,
    createdAt: product.created_at,
  })

  return product
})
