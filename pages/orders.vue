<template>
  <MainLayout>
    <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="flex items-center text-2xl font-bold mb-6">
        <Icon name="carbon:delivery" color="#5FCB04" size="35" />
        <span class="pl-4">Orders</span>
      </div>
      <div
        v-if="orders"
        class="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4"
      >
        <div v-for="order in orders" :key="order.id">
          <div class="bg-white rounded-lg p-4">
            <div class="text-lg font-bold mb-2">${{ order.totalPrice / 100 }}</div>
            <div class="text-sm text-gray-500">Order ID: {{ order.stripeId }}</div>
            <div class="text-sm text-gray-500">Status: {{ order.status }}</div>
            <div class="pt-2"></div>
            <div v-for="item in order.orderItem" :key="item.id">
              <NuxtLink
                class="flex items-center gap-3 p-1 hover:underline hover:text-blue-500"
                :to="`/item/${item.id}`"
              >
                <img width="40" :src="item.url" />
                {{ item.title }}
              </NuxtLink>
            </div>
            <div class="pt-2 pb-5">
              Delivery Address: {{ order.name }}, {{ order.address }}, {{ order.zipCode }},
              {{ order.city }}, {{ order.country }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center">You have no order history</div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IOrder } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useAuthUser } from '~/composables/useAuthUser'

  const userStore = useUserStore()
  const user = ref(await useAuthUser())
  const orders = ref<IOrder[] | null>(null)

  if (user.value) {
    useAsyncData(() =>
      $fetch<IOrder[]>(`/api/prisma/get-all-orders-by-user/${user.value?.id}`).then((res) => {
        orders.value = res
        setTimeout(() => (userStore.isLoading = false), 200)
      })
    )
  }

  onMounted(() => {
    if (!user.value) {
      return navigateTo('/auth')
    }
  })
</script>
