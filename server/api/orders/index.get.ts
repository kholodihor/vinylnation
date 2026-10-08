export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return prisma.orders.findMany({
    where: { userId: user.id },
    orderBy: { id: 'desc' },
    include: { orderItem: { include: { product: true } } },
  })
})
