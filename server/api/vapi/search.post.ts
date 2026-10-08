import type { Prisma } from '@prisma/client'

/** Narrowing search for the voice assistant: tries the most specific match first */
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Origin': '*',
  })

  const body = await readBody(event)
  const userQuery = String(body?.query || body?.message || '').trim()
  if (!userQuery) {
    return { error: 'No query provided' }
  }

  const topic = process.env.KAFKA_ASSISTANT_TOPIC || 'assistant'
  await sendKafkaEvent(topic, null, {
    type: 'assistant.query',
    query: userQuery,
    timestamp: Date.now(),
  })

  const results = (await searchStaged(userQuery)).map(toAssistantProduct)

  await sendKafkaEvent(topic, null, {
    type: 'assistant.results',
    query: userQuery,
    resultCount: results.length,
    timestamp: Date.now(),
  })

  return {
    query: userQuery,
    results,
    summary: describeResults(results, userQuery),
  }
})

async function searchStaged(query: string) {
  const terms = getSearchTerms(query)
  const find = (where: Prisma.ProductsWhereInput, orderBy = DEFAULT_ORDER) =>
    prisma.products.findMany({ where, take: 10, orderBy })

  const stages: Array<() => Promise<Awaited<ReturnType<typeof find>>>> = [
    // 1. Whole phrase in the title
    () => find({ title: { contains: query, mode: 'insensitive' } }),
  ]

  if (terms.length) {
    // 2. Any meaningful word in the title
    stages.push(() =>
      find({ OR: terms.map((term) => ({ title: { contains: term, mode: 'insensitive' } })) })
    )
    // 3. Genre match
    stages.push(() =>
      find({
        OR: [query, ...terms].map((term) => ({ genre: { contains: term, mode: 'insensitive' } })),
      })
    )
  }

  const price = getPriceFilter(query)
  if (price) {
    // 4. Price-only query ("albums under $30")
    stages.push(() => find({ price }, [{ price: 'asc' }, { quantity: 'desc' }]))
  }

  if (isStockQuery(query)) {
    // 5. Generic "what do you have in stock?"
    stages.push(() => find({ quantity: { gt: 0 } }))
  }

  for (const stage of stages) {
    const products = await stage()
    if (products.length) return products
  }
  return []
}
