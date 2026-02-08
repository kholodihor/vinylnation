// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,

  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-lodash',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    [
      '@nuxtjs/supabase',
      {
        redirectOptions: {
          login: '/auth',
          callback: '/auth',
          exclude: ['/', '/products', '/product/*', '/auth'],
        },
      },
    ],
  ],

  build: {
    transpile: ['pinia-plugin-persistedstate'],
  },

  // Optimizations for bundle size
  nitro: {
    minify: true,
    routeRules: {
      '/api/**': { cache: { maxAge: 300 } },
      '/': { prerender: true },
    },
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
  },

  // Optimized runtime config
  runtimeConfig: {
    public: {
      stripePk: process.env.STRIPE_PK_KEY,
      // Vapi public runtime values (client-exposed)
      vapiToken: process.env.NUXT_PUBLIC_VAPI_TOKEN,
      vapiAssistantId: process.env.NUXT_PUBLIC_VAPI_ASSISTANT_ID,
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      script: [{ src: 'https://js.stripe.com/v3/', defer: true }],
      title: 'VinylNation',
      meta: [
        { name: 'description', content: 'Modern e-commerce platform for vinyl records' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://avatars.githubusercontent.com' },
      ],
    },
  },

  // Optimized image configuration
  image: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  compatibilityDate: '2024-12-25',

  devServer: {
    port: 3001,
  },

  // Vite optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', '@nuxt/schema'],
            ui: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
            db: ['@prisma/client', 'prisma'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['vue', '@nuxt/schema'],
    },
  },
})
