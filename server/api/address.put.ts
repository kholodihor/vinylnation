const FIELDS = ['name', 'address', 'zipcode', 'city', 'country'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const data = Object.fromEntries(
    FIELDS.map((field) => [field, String(body?.[field] ?? '').trim()])
  ) as Record<(typeof FIELDS)[number], string>

  const missing = FIELDS.filter((field) => !data[field])
  if (missing.length) {
    throw createError({ statusCode: 400, message: `Missing fields: ${missing.join(', ')}` })
  }

  // userId is unique, so each user has at most one address
  return prisma.addresses.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  })
})
