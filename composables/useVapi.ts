import type Vapi from '@vapi-ai/web'

export function useVapi() {
  const { $vapi } = useNuxtApp() as unknown as { $vapi?: Vapi }
  const config = useRuntimeConfig()

  const isCalling = useState<boolean>('vapi:isCalling', () => false)
  const assistantText = useState<string>('vapi:assistantText', () => '')

  // Ensure listeners are only attached once per app lifecycle
  const listenersAttached = useState<boolean>('vapi:listenersAttached', () => false)

  // Only attach listeners on the client when $vapi is available
  if (process.client && $vapi && !listenersAttached.value) {
    // Update isCalling on start/stop (SDK event names use dashes)
    $vapi.on('call-start', () => {
      isCalling.value = true
    })
    $vapi.on('call-end', () => {
      isCalling.value = false
    })

    // Capture assistant speech text
    $vapi.on('speech-end', () => {})

    // Capture messages for assistant content
    $vapi.on('message', (message: any) => {
      const text = typeof message?.content === 'string' ? message.content : ''
      if (text) assistantText.value = text
    })

    listenersAttached.value = true
  }

  const start = async (assistantId?: string) => {
    const id = assistantId || (config.public as any).vapiAssistantId
    if (!id) {
      throw new Error('Missing Vapi assistant ID. Set NUXT_PUBLIC_VAPI_ASSISTANT_ID in your .env')
    }
    if (!process.client || !$vapi) return
    await $vapi.start(id)
  }

  const stop = async () => {
    if (!process.client || !$vapi) return
    await $vapi.stop()
  }

  const toggleCall = async (assistantId?: string) => {
    if (!process.client || !$vapi) return
    if ((($vapi as any).isCalling ?? false) || isCalling.value) {
      await stop()
    } else {
      await start(assistantId)
    }
  }

  const searchAlbums = async (query: string) => {
    try {
      const response = await $fetch('/api/vapi/function', {
        method: 'POST',
        body: { query }
      })
      return response
    } catch (error) {
      console.error('Product search error:', error)
      return { error: 'Failed to search products' }
    }
  }

  const getInventory = async () => {
    try {
      const response = await $fetch('/api/vapi/inventory')
      return response
    } catch (error) {
      console.error('Inventory error:', error)
      return { error: 'Failed to get inventory' }
    }
  }

  return {
    vapi: $vapi,
    isCalling,
    assistantText,
    start,
    stop,
    toggleCall,
    searchAlbums,
    getInventory,
  }
}
