<template>
  <MainLayout>
    <div id="AddressPage" class="mt-4 max-w-[500px] mx-auto px-2">
      <div class="mx-auto bg-white rounded-lg p-3">
        <div class="text-xl text-bold mb-2">Add a Vinyl</div>
        <form @submit.prevent="addProduct()">
          <TextInput
            v-model:input="form.title"
            class="w-full"
            placeholder="Title"
            input-type="text"
            :error="error && error.type == 'title' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.genre"
            class="w-full mt-2"
            placeholder="Genre"
            input-type="text"
            :error="error && error.type == 'genre' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.imageUrl"
            class="w-full mt-2"
            placeholder="Image Url"
            input-type="text"
            :error="error && error.type == 'imageUrl' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.price"
            class="w-full mt-2"
            placeholder="Price"
            input-type="text"
            :error="error && error.type == 'price' ? error.message : ''"
          />

          <TextArea
            v-model:input="form.description"
            class="w-full mt-2"
            placeholder="Description"
            input-type="text"
            :error="error && error.type == 'description' ? error.message : ''"
          />

          <button
            :disabled="isSubmitting"
            type="submit"
            class="mt-6 bg-[#f8d210] w-full text-black text-[21px] border hover:border-black font-semibold p-1.5 rounded-lg"
          >
            <div v-if="!isSubmitting">Add a Vinyl</div>
            <Icon v-else name="eos-icons:loading" size="25" class="mr-2" />
          </button>
        </form>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
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
        message: 'A title is required',
      }
    } else if (!form.genre) {
      error.value = {
        type: 'genre',
        message: 'A genre is required',
      }
    } else if (!form.description) {
      error.value = {
        type: 'description',
        message: 'A description is required',
      }
    } else if (!form.imageUrl) {
      error.value = {
        type: 'imageUrl',
        message: 'A url of an image is required',
      }
    } else if (!form.price) {
      error.value = {
        type: 'price',
        message: 'A price is required',
      }
    }
    if (error.value) {
      isSubmitting.value = false
      return
    }

    await useFetch(`/api/prisma/add-product`, {
      method: 'POST',
      body: {
        title: form.title,
        genre: form.genre,
        url: form.imageUrl,
        description: form.description,
        price: Number(form.price) * 100,
      },
    })
    isSubmitting.value = false
    return navigateTo('/')
  }
</script>
