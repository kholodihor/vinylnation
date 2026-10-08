/**
 * Fulfils an order after verifying its Stripe payment. The product list and
 * owner come from the PaymentIntent metadata set by /api/stripe/payment-intent.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { paymentIntentId } = await readBody(event)
  if (typeof paymentIntentId !== 'string' || !paymentIntentId) {
    throw createError({ statusCode: 400, message: 'paymentIntentId is required' })
  }

  const intent = await useStripe().paymentIntents.retrieve(paymentIntentId)
  if (intent.status !== 'succeeded' || intent.metadata.userId !== user.id) {
    throw createError({ statusCode: 402, message: 'Payment has not been completed' })
  }

  // Idempotent: retrying the same payment returns the existing order
  const existing = await prisma.orders.findFirst({ where: { stripeId: intent.id } })
  if (existing) return existing

  const address = await prisma.addresses.findUnique({ where: { userId: user.id } })
  if (!address) {
    throw createError({ statusCode: 400, message: 'Shipping address is missing' })
  }

  const productIds = intent.metadata.productIds.split(',').map(Number)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.orders.create({
      data: {
        userId: user.id,
        stripeId: intent.id,
        name: address.name,
        address: address.address,
        zipcode: address.zipcode,
        city: address.city,
        country: address.country,
        orderItem: { create: productIds.map((productId) => ({ productId })) },
      },
    })
    await tx.products.updateMany({
      where: { id: { in: productIds } },
      data: { quantity: { decrement: 1 } },
    })
    return created
  })
  invalidateProducts()

  await sendKafkaEvent(process.env.KAFKA_PAYMENTS_TOPIC || 'payments', intent.id, {
    type: 'payment.succeeded',
    id: intent.id,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    created: intent.created,
  })

  const inventoryTopic = process.env.KAFKA_INVENTORY_TOPIC || 'inventory'
  const updated = await prisma.products.findMany({ where: { id: { in: productIds } } })
  for (const product of updated) {
    await sendKafkaEvent(inventoryTopic, String(product.id), {
      type: 'inventory.updated',
      id: product.id,
      quantity: product.quantity,
      delta: -1,
    })
  }

  await sendKafkaEvent(process.env.KAFKA_ORDERS_TOPIC || 'orders', String(order.id), {
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
    products: updated,
  })

  return order
})
