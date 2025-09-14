import Vapi from '@vapi-ai/web'

export default defineNuxtPlugin(() => {
  // Client-only plugin (file uses .client.ts suffix)
  const config = useRuntimeConfig()
  const token = (config.public.vapiToken as string | undefined) ?? ''

  // Create a singleton Vapi instance exposed via Nuxt provide/inject
  const vapi = new Vapi(token)

  return {
    provide: {
      vapi,
    },
  }
})
