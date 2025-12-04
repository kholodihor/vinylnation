import { sendKafkaEvent } from '../../utils/kafka'

export default defineEventHandler(async (event) => {
  try {
    const { query } = await readBody(event)

    if (!query) {
      return { error: 'No query provided' }
    }

    console.log('Vapi server function called with query:', query)

    const assistantTopic = process.env.KAFKA_ASSISTANT_TOPIC || 'assistant'

    await sendKafkaEvent(assistantTopic, null, {
      type: 'assistant.function_called',
      query,
      timestamp: Date.now(),
    })

    // This is a server-side function that Vapi can call
    // We'll return structured data that the assistant can use
    const response = await $fetch('/api/vapi/products?q=' + encodeURIComponent(query), {
      method: 'GET',
    })

    const result = {
      success: true,
      data: response,
      message: `I searched for albums related to "${query}"`,
    }

    await sendKafkaEvent(assistantTopic, null, {
      type: 'assistant.function_result',
      query,
      success: true,
      timestamp: Date.now(),
    })

    return result
  } catch (error: any) {
    console.error('Vapi server function error:', error)
    return {
      error: 'Failed to search albums',
      details: error.message,
    }
  }
})
