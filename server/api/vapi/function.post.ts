export default defineEventHandler(async (event) => {
  try {
    const { query } = await readBody(event)

    if (!query) {
      return { error: 'No query provided' }
    }

    console.log('Vapi server function called with query:', query)

    // This is a server-side function that Vapi can call
    // We'll return structured data that the assistant can use
    const response = await $fetch('/api/vapi/products?q=' + encodeURIComponent(query), {
      method: 'GET',
    })

    return {
      success: true,
      data: response,
      message: `I searched for albums related to "${query}"`,
    }
  } catch (error: any) {
    console.error('Vapi server function error:', error)
    return {
      error: 'Failed to search albums',
      details: error.message,
    }
  }
})
