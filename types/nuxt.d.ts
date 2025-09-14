import type Vapi from '@vapi-ai/web'

// Augment Nuxt App and Vue to include $vapi
declare module '#app' {
  interface NuxtApp {
    $vapi: Vapi
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $vapi: Vapi
  }
}

export {}
