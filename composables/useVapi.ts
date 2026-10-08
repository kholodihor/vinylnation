import type { VapiSearchResponse } from '~/types'

export function useVapi() {
  const { $getVapi } = useNuxtApp()
  const config = useRuntimeConfig()

  const isCalling = useState('vapi:isCalling', () => false)
  const assistantText = useState('vapi:assistantText', () => '')
  const listenersAttached = useState('vapi:listenersAttached', () => false)

  const loadVapi = async () => {
    if (!$getVapi) return null // server side
    const vapi = await $getVapi()
    // Attach SDK listeners once per app lifecycle
    if (!listenersAttached.value) {
      vapi.on('call-start', () => (isCalling.value = true))
      vapi.on('call-end', () => (isCalling.value = false))
      vapi.on('message', (message: { content?: unknown }) => {
        if (typeof message?.content === 'string' && message.content) {
          assistantText.value = message.content
        }
      })
      listenersAttached.value = true
    }
    return vapi
  }

  const start = async (assistantId?: string) => {
    const id = assistantId || (config.public.vapiAssistantId as string | undefined)
    if (!id) {
      throw new Error('Missing Vapi assistant ID. Set NUXT_PUBLIC_VAPI_ASSISTANT_ID in your .env')
    }
    const vapi = await loadVapi()
    await vapi?.start(id)
  }

  const stop = async () => {
    const vapi = await loadVapi()
    await vapi?.stop()
  }

  const toggleCall = (assistantId?: string) => (isCalling.value ? stop() : start(assistantId))

  const searchAlbums = async (query: string): Promise<VapiSearchResponse> => {
    try {
      return await $fetch<VapiSearchResponse>('/api/vapi/function', {
        method: 'POST',
        body: { query },
      })
    } catch (error) {
      console.error('Product search error:', error)
      return { error: 'Failed to search products' }
    }
  }

  const getInventory = async () => {
    try {
      return await $fetch('/api/vapi/inventory')
    } catch (error) {
      console.error('Inventory error:', error)
      return { error: 'Failed to get inventory' }
    }
  }

  return {
    isCalling,
    assistantText,
    start,
    stop,
    toggleCall,
    searchAlbums,
    getInventory,
  }
}
