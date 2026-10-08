import type Vapi from '@vapi-ai/web'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let instance: Promise<Vapi> | null = null

  // The Vapi SDK (with its WebRTC dependencies) is large, so it is only
  // downloaded the first time a call is started
  const getVapi = () =>
    (instance ??= import('@vapi-ai/web').then(
      ({ default: VapiClient }) => new VapiClient((config.public.vapiToken as string) ?? '')
    ))

  return {
    provide: { getVapi },
  }
})
