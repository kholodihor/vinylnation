<template>
  <div>
    <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="bg-white w-full p-6 min-h-[150px]">
        <div class="flex items-center text-xl">
          <Icon name="carbon:delivery" color="#5FCB04" size="35" />
          <span class="pl-4">Orders</span>
        </div>
        <div v-if="orders">
          <div v-for="order in orders" :key="order.id" class="text-sm pl-[50px]">
            <div class="border-b py-1">
              <p>Stripe ID: {{ order.stripeId }}</p>

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
                {{ order.city }},
                {{ order.country }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center">You have no order history</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IOrder } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const user = useSupabaseUser()

  const orders = ref<IOrder[] | null>(null)

  onBeforeMount(async () => {
    if (user.value) {
      const res = await useFetch<IOrder[]>(`/api/prisma/get-all-orders-by-user/${user.value.id}`)
      orders.value = res.data.value
    }
  })

  onMounted(() => {
    if (!user.value) {
      return navigateTo('/auth')
    }
    setTimeout(() => (userStore.isLoading = false), 200)
  })
</script>
