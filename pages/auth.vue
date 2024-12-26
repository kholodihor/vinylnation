<template>
  <div class="min-h-screen bg-gray-50">
    <div
      class="w-full flex items-center justify-center p-4 sm:p-5 bg-white border-b border-gray-200 shadow-sm"
    >
      <NuxtLink to="/" class="min-w-[120px] sm:min-w-[170px] transition-transform hover:scale-105">
        <img width="170" src="/logo.png" alt="Vinyl Nation Logo" />
      </NuxtLink>
    </div>

    <div class="max-w-[400px] mx-auto px-4 py-8 sm:py-12">
      <div class="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 class="text-2xl font-bold text-center mb-2">Welcome to Vinyl Nation</h1>
        <p class="text-gray-500 text-center text-sm mb-8">Sign in to continue your vinyl journey</p>

        <div class="space-y-4">
          <button
            class="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors relative group"
            @click="login('google')"
          >
            <img class="w-5 h-5 absolute left-6" src="/google-logo.png" alt="Google Logo" />
            <span>Continue with Google</span>
            <Icon
              name="material-symbols:arrow-forward-rounded"
              size="20"
              class="absolute right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all"
            />
          </button>

          <button
            class="flex items-center justify-center gap-3 w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white font-medium px-6 py-3 rounded-lg transition-colors relative group"
            @click="login('github')"
          >
            <img class="w-5 h-5 absolute left-6" src="/github-logo.png" alt="GitHub Logo" />
            <span>Continue with GitHub</span>
            <Icon
              name="material-symbols:arrow-forward-rounded"
              size="20"
              class="absolute right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all"
            />
          </button>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            By continuing, you agree to Vinyl Nation's
            <NuxtLink to="/terms" class="text-[#f8d210] hover:underline">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-[#f8d210] hover:underline">Privacy Policy</NuxtLink>
          </p>
        </div>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/" class="text-sm text-gray-600 hover:text-[#f8d210] transition-colors">
          ← Back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
  const client = useSupabaseClient()
  const user = useSupabaseUser()

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
