export default defineEventHandler(async (event) => {
  const { data, hit } = await getAllProducts()
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=60',
    'X-Cache': hit ? 'HIT' : 'MISS',
  })
  return data
})
