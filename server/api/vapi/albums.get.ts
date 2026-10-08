export default defineEventHandler(async (event) => {
  const q = getQuery(event).q
  const userQuery = typeof q === 'string' ? q.trim() : ''
  if (!userQuery) {
    return { error: 'No query provided' }
  }

  const products = await prisma.products.findMany({
    where: buildSearchWhere(userQuery),
    take: 8,
    orderBy: DEFAULT_ORDER,
  })
  const results = products.map(toAssistantProduct)

  return {
    query: userQuery,
    results,
    summary: summarizeResults(results, userQuery),
  }
})
