<template>
  <div id="AuthPage" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="w-full bg-white shadow-sm">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-center p-4">
          <NuxtLink to="/" class="min-w-[170px] hover:opacity-90 transition-opacity">
            <img width="170" src="/logo.png" alt="VinylNation Logo" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Auth Container -->
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-2">Welcome to VinylNation</h1>
        <p class="text-center text-gray-600 mb-8">Sign in to access your vinyl collection</p>

        <div class="space-y-4">
          <button
            class="flex items-center justify-center gap-3 w-full p-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-all duration-200"
            @click="login('google')"
          >
            >
            <img class="w-6 h-6" src="/google-logo.png" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <button
            class="flex items-center justify-center gap-3 w-full p-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-all duration-200"
            @click="login('github')"
          >
            >
            <img class="w-6 h-6" src="/github-logo.png" alt="GitHub" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <p class="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to VinylNation's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  definePageMeta({
    layout: false,
  })

  const client = useSupabaseClient()
  const user = ref(await useAuthUser())

  watchEffect(() => {
    if (user.value) {
      return navigateTo('/')
    }
  })

  const login = async (prov) => {
    await client.auth.signInWithOAuth({
      provider: prov,
      redirectTo: window.location.origin,
    })
  }
</script>
