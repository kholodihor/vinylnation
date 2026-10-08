export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody(event)

  const title = String(body?.title ?? '').trim()
  const genre = String(body?.genre ?? '').trim()
  const url = String(body?.url ?? '').trim()
  const description = String(body?.description ?? '').trim()
  const price = Number(body?.price)
  const quantity = body?.quantity === undefined ? undefined : Number(body.quantity)

  if (!title || !genre || !url || !description) {
    throw createError({
      statusCode: 400,
      message: 'title, genre, url and description are required',
    })
  }
  if (!Number.isInteger(price) || price <= 0) {
    throw createError({ statusCode: 400, message: 'price must be a positive integer (cents)' })
  }
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
    throw createError({ statusCode: 400, message: 'quantity must be a non-negative integer' })
  }

  const product = await prisma.products.create({
    data: { title, genre, url, description, price, quantity },
  })
  invalidateProducts()

  await sendKafkaEvent(process.env.KAFKA_INVENTORY_TOPIC || 'inventory', String(product.id), {
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
