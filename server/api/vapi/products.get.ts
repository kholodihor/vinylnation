export default defineEventHandler(async (event) => {
  const q = getQuery(event).q
  const userQuery = typeof q === 'string' ? q.trim() : ''

  const products = await prisma.products.findMany({
    where: userQuery ? buildSearchWhere(userQuery) : undefined,
    take: 10,
    orderBy: DEFAULT_ORDER,
  })
  const results = products.map(toAssistantProduct)
  const label = userQuery || 'all available products'

  return {
    query: userQuery || 'all products',
    results,
    summary: summarizeResults(results, label),
  }
})
