export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: 'Invalid product id' })
  }

  const product = await prisma.products.findUnique({ where: { id } })
  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }
  return product
})
