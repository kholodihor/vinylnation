import type Vapi from '@vapi-ai/web'

// $getVapi is provided by plugins/vapi.client.ts (client only)
declare module '#app' {
  interface NuxtApp {
    $getVapi?: () => Promise<Vapi>
  }
}

export {}
