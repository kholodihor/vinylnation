export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return prisma.addresses.findUnique({ where: { userId: user.id } })
})
