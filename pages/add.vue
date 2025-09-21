<template>
  <div>
    <div class="max-w-[600px] mx-auto px-4 py-6 sm:py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-2">Add a New Vinyl</h1>
          <p class="text-gray-500 text-sm">
            Share your vinyl with the community. Please provide accurate details.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="addProduct()">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <TextInput
              v-model:input="form.title"
              placeholder="Enter vinyl title"
              input-type="text"
              :error="error && error.type === 'title' ? error.message : ''"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
            <TextInput
              v-model:input="form.genre"
              placeholder="Enter vinyl genre"
              input-type="text"
              :error="error && error.type === 'genre' ? error.message : ''"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <TextInput
              v-model:input="form.imageUrl"
              placeholder="Enter vinyl cover image URL"
              input-type="text"
              :error="error && error.type === 'imageUrl' ? error.message : ''"
            />
            <p v-if="form.imageUrl" class="mt-2 text-xs text-gray-500">
              Preview:
              <img
                :src="form.imageUrl"
                class="mt-1 w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                alt="Vinyl cover preview"
              />
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
            <TextInput
              v-model:input="form.price"
              placeholder="Enter price in cents (e.g., 2000 for $20.00)"
              input-type="number"
              :error="error && error.type === 'price' ? error.message : ''"
            />
            <p class="mt-1 text-xs text-gray-500">
              Preview: ${{ form.price ? (parseInt(form.price) / 100).toFixed(2) : '0.00' }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <TextArea
              v-model:input="form.description"
              placeholder="Enter vinyl description"
              :error="error && error.type === 'description' ? error.message : ''"
            />
          </div>

          <div class="pt-2">
            <button
              :disabled="isSubmitting"
              type="submit"
              class="w-full bg-[#f8d210] hover:bg-[#e5c20f] text-black font-medium text-lg py-3 px-6 rounded-lg transition-colors relative"
            >
              <span v-if="!isSubmitting">Add Vinyl</span>
              <div v-else class="flex items-center justify-center gap-2">
                <Icon name="eos-icons:loading" size="24" class="animate-spin" />
                <span>Adding...</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IError } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const error = ref<IError | null>(null)
  const isSubmitting = ref(false)

  const form = reactive({
    title: '',
    genre: '',
    imageUrl: '',
    description: '',
    price: '',
  })

  onBeforeMount(() => {
    setTimeout(() => (userStore.isLoading = false), 1000)
  })

  const addProduct = async () => {
    isSubmitting.value = true
    error.value = null

    if (!form.title) {
      error.value = {
        type: 'title',
        message: 'Please enter a title',
      }
    } else if (!form.genre) {
      error.value = {
        type: 'genre',
        message: 'Please enter a genre',
      }
    } else if (!form.description) {
      error.value = {
        type: 'description',
        message: 'Please enter a description',
      }
    } else if (!form.imageUrl) {
      error.value = {
        type: 'imageUrl',
        message: 'Please enter an image URL',
      }
    } else if (!form.price) {
      error.value = {
        type: 'price',
        message: 'Please enter a price',
      }
    }

    if (error.value) {
      isSubmitting.value = false
      return
    }

    try {
      await $fetch('/api/prisma/add-product', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description,
          url: form.imageUrl,
          price: parseInt(form.price),
          genre: form.genre,
        },
      })

      navigateTo('/main')
    } catch (err) {
      console.log(err)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
