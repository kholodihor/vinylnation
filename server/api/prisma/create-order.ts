import { PrismaClient } from '@prisma/client'
import { sendKafkaEvent } from '../../utils/kafka'
import type { IProduct } from '~/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const order = await prisma.orders.create({
    data: {
      userId: body.userId,
      stripeId: body.stripeId,
      name: body.name,
      address: body.address,
      zipcode: body.zipcode,
      city: body.city,
      country: body.country,
    },
  })

  const inventoryTopic = process.env.KAFKA_INVENTORY_TOPIC || 'inventory'

  for (const product of body.products as IProduct[]) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: Number(product.id),
      },
    })

    // Decrement stock for each purchased product by 1
    const updatedProduct = await prisma.products.update({
      where: { id: Number(product.id) },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    })

    await sendKafkaEvent(inventoryTopic, String(updatedProduct.id), {
      type: 'inventory.updated',
      id: updatedProduct.id,
      quantity: updatedProduct.quantity,
      delta: -1,
    })
  }

  const ordersTopic = process.env.KAFKA_ORDERS_TOPIC || 'orders'

  await sendKafkaEvent(ordersTopic, String(order.id), {
    type: 'order.created',
    id: order.id,
    userId: order.userId,
    stripeId: order.stripeId,
    name: order.name,
    address: order.address,
    zipcode: order.zipcode,
    city: order.city,
    country: order.country,
    createdAt: order.created_at,
    products: body.products,
  })

  return order
})
