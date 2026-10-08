// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-lodash',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],

  supabase: {
    redirectOptions: {
      login: '/auth',
      callback: '/auth',
      // Pages reachable without signing in; everything else redirects to /auth
      exclude: ['/', '/item/*', '/cart', '/assistant'],
    },
  },

  build: {
    transpile: ['pinia-plugin-persistedstate'],
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SK_KEY,
    public: {
      stripePk: process.env.STRIPE_PK_KEY,
      vapiToken: process.env.NUXT_PUBLIC_VAPI_TOKEN,
      vapiAssistantId: process.env.NUXT_PUBLIC_VAPI_ASSISTANT_ID,
    },
  },

  app: {
    head: {
      title: 'VinylNation',
      meta: [{ name: 'description', content: 'Modern e-commerce platform for vinyl records' }],
      link: [
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://avatars.githubusercontent.com' },
      ],
    },
  },

  image: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    format: ['webp'],
  },

  compatibilityDate: '2024-12-25',

  devServer: {
    port: 3001,
  },
})
