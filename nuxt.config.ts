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
          exclude: ['/', '/products', '/product/*'],
        },
      },
    ],
  ],

  build: {
    transpile: ['pinia-plugin-persistedstate'],
  },

  runtimeConfig: {
    public: {
      stripePk: process.env.STRIPE_PK_KEY,
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      script: [{ src: 'https://js.stripe.com/v3/', defer: true }],
      title: 'VinylNation',
    },
  },

  image: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },

  compatibilityDate: '2024-12-25',
})
