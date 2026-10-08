/**
 * Creates a PaymentIntent whose amount is computed from database prices,
 * never from a client-supplied total. The product ids and user are stored in
 * metadata so POST /api/orders can verify the payment before fulfilling.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const productIds = parseProductIds(body?.productIds)

  const products = await prisma.products.findMany({ where: { id: { in: productIds } } })
  if (products.length !== productIds.length) {
    throw createError({ statusCode: 400, message: 'Some products no longer exist' })
  }
  const soldOut = products.filter((p) => p.quantity < 1)
  if (soldOut.length) {
    throw createError({
      statusCode: 409,
      message: `Out of stock: ${soldOut.map((p) => p.title).join(', ')}`,
    })
  }

  const amount = products.reduce((sum, p) => sum + p.price, 0)
  const paymentIntent = await useStripe().paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId: user.id, productIds: productIds.join(',') },
  })

  await sendKafkaEvent(process.env.KAFKA_PAYMENTS_TOPIC || 'payments', paymentIntent.id, {
    type: 'payment.intent_created',
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    created: paymentIntent.created,
  })

  return { clientSecret: paymentIntent.client_secret, amount }
})

function parseProductIds(value: unknown) {
  const ids = Array.isArray(value) ? [...new Set(value.map(Number))] : []
  if (!ids.length || !ids.every(Number.isInteger)) {
    throw createError({ statusCode: 400, message: 'productIds must be a non-empty array of ids' })
  }
  return ids
}
