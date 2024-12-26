<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div class="md:flex gap-6 justify-between mx-auto w-full">
        <div class="md:w-[45%]">
          <div
            v-if="product?.url"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              :src="product?.url"
              :alt="product?.title"
            />
          </div>
        </div>

        <div class="md:w-[55%] bg-white p-4 sm:p-6 rounded-lg mt-6 md:mt-0">
          <div v-if="product" class="space-y-4">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold mb-2">{{ product.title }}</h1>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-600">Genre:</span>
                <span class="px-2 py-0.5 bg-[#c55ffc]/10 text-[#c55ffc] rounded">
                  {{ product.genre }}
                </span>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex items-center gap-4">
                <div class="text-2xl sm:text-3xl font-bold">${{ priceComputed }}</div>
                <div class="text-[#009A66] text-sm font-medium">Free Shipping</div>
              </div>

              <div class="mt-3 space-y-2">
                <div class="flex items-center gap-2 text-sm text-[#009A66]">
                  <Icon name="material-symbols:local-shipping-outline" size="18" />
                  <span>Over 11-day free delivery</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-[#009A66]">
                  <Icon name="material-symbols:verified-outline" size="18" />
                  <span>Authenticity guaranteed</span>
                </div>
              </div>
            </div>

            <div class="border-t pt-4">
              <h2 class="text-lg font-semibold mb-2">Description</h2>
              <div
                class="text-sm text-gray-600 leading-relaxed max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar"
              >
                {{ product.description }}
              </div>
            </div>

            <div class="border-t pt-4">
              <button
                :disabled="isInCart"
                class="w-full sm:w-auto px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300"
                :class="[
                  isInCart
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#f8d210] hover:bg-[#e5c20f] text-black',
                ]"
                @click="addToCart()"
              >
                <div class="flex items-center justify-center gap-2">
                  <Icon
                    :name="
                      isInCart
                        ? 'material-symbols:check-circle-outline'
                        : 'material-symbols:shopping-cart-outline'
                    "
                    size="24"
                  />
                  <span>{{ isInCart ? 'Added to Cart' : 'Add to Cart' }}</span>
                </div>
              </button>
            </div>
          </div>

          <div v-else class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const route = useRoute()
  const product = ref<IProduct | null>(null)

  onBeforeMount(async () => {
    const res = await useFetch<IProduct>(`/api/prisma/get-product-by-id/${route.params.id}`)
    setTimeout(() => (userStore.isLoading = false), 1000)
    product.value = res.data.value
  })

  const isInCart = computed(() => {
    let res = false
    userStore.cart.forEach((prod: IProduct) => {
      if (route.params.id === prod?.id.toString()) {
        res = true
      }
    })
    return res
  })

  const priceComputed = computed(() => {
    if (product.value) {
      return product.value.price / 100
    }
    return '0.00'
  })

  const addToCart = () => {
    if (product.value) {
      userStore.cart.push(product.value)
    }
  }
</script>

<style scoped>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 3px;
  }
</style>
