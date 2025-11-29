<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🎵 Enhanced Vapi Assistant</h1>
      <p class="text-gray-600">
        Ask me about our real inventory, prices, and product availability!
      </p>
    </div>

    <!-- Example Queries -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-semibold text-blue-900 mb-3">Try these example queries:</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <button
          v-for="example in examples"
          :key="example"
          class="text-left p-2 bg-white rounded border hover:bg-blue-100 transition-colors"
          @click="testQuery(example)"
        >
          "{{ example }}"
        </button>
      </div>
    </div>

    <!-- Search Form -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h3 class="font-semibold mb-3">Test Custom Query:</h3>
      <div class="flex gap-2">
        <input
          v-model="customQuery"
          type="text"
          placeholder="Ask about our products, genres, or prices..."
          class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="testQuery(customQuery)"
        />
        <button
          :disabled="!customQuery.trim() || loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          @click="testQuery(customQuery)"
        >
          {{ loading ? 'Searching...' : 'Ask' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="results" class="bg-white rounded-lg shadow-md p-4">
      <h3 class="font-semibold mb-3">Assistant Response:</h3>
      <div class="prose max-w-none">
        <p class="text-gray-700 mb-4">{{ results.message }}</p>

        <div v-if="results.albums && results.albums.length > 0" class="space-y-3">
          <h4 class="font-medium text-gray-900">Found Albums:</h4>
          <div
            v-for="album in results.albums"
            :key="album.title"
            class="border rounded-lg p-3 bg-gray-50"
          >
            <h5 class="font-medium text-gray-900">{{ album.title }}</h5>
            <p class="text-sm text-gray-600">{{ album.details }}</p>
            <p class="text-sm font-medium text-green-600">
              {{ album.price }} - {{ album.availability }}
            </p>
            <p v-if="album.description" class="text-sm text-gray-500 mt-1">
              {{ album.description }}
            </p>
          </div>
        </div>

        <div
          v-if="results.suggestions && results.suggestions.length > 0"
          class="mt-4 pt-4 border-t"
        >
          <h4 class="font-medium text-gray-900 mb-2">You can also ask:</h4>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li v-for="suggestion in results.suggestions" :key="suggestion">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 class="font-semibold text-red-900 mb-2">Error:</h3>
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  // Type definitions for API response
  import type { VapiSearchResponse } from '~/types'

  const examples = [
    'What products do you have in stock?',
    'Show me albums under $30',
    'What genres are available?',
    'Do you have any jazz records?',
    'What are your newest arrivals?',
    'Show me budget-friendly albums',
    'What are your most popular items?',
    'Tell me about your inventory',
  ]
  const error = ref('')
  const loading = ref(false)
  const results = ref<{ message: string; albums?: any[]; suggestions?: string[] } | null>(null)
  const customQuery = ref('')

  const { searchAlbums } = useVapi()

  const testQuery = async (query: string) => {
    if (!query.trim()) return

    loading.value = true
    error.value = ''
    results.value = null

    try {
      const response = (await searchAlbums(query)) as VapiSearchResponse

      // Check if response has error property (any error case)
      if ('error' in response) {
        error.value = response.error
      } else if ('success' in response && response.success && 'data' in response) {
        // Success case with data
        results.value = response.data.summary
      } else {
        error.value = 'Invalid response format'
      }
    } catch {
      error.value = 'Failed to search albums. Please try again.'
    } finally {
      loading.value = false
    }
  }
</script>
