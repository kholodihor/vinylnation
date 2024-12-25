<template>
  <MainLayout>
    <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="md:flex gap-4 justify-between mx-auto w-full">
        <div class="md:w-[65%]">
          <div class="bg-white rounded-lg p-4">
            <div class="text-xl font-semibold mb-2">Shipping Address</div>

            <div v-if="currentAddress">
              <NuxtLink
                to="/address"
                class="flex items-center pb-2 text-blue-500 hover:text-red-400"
              >
                <Icon name="mdi:plus" size="18" class="mr-2" />
                Update Address
              </NuxtLink>

              <div class="pt-2 border-t">
                <div class="underline pb-1">Delivery Address</div>
                <ul class="text-xs">
                  <li class="flex items-center gap-2">
                    <div>Contact name:</div>
                    <div class="font-bold">{{ currentAddress.name }}</div>
                  </li>
                  <li class="flex items-center gap-2">
                    <div>Address:</div>
                    <div class="font-bold">
                      {{ currentAddress.address }}
                    </div>
                  </li>
                  <li class="flex items-center gap-2">
                    <div>Zip Code:</div>
                    <div class="font-bold">
                      {{ currentAddress.zipCode }}
                    </div>
                  </li>
                  <li class="flex items-center gap-2">
                    <div>City:</div>
                    <div class="font-bold">{{ currentAddress.city }}</div>
                  </li>
                  <li class="flex items-center gap-2">
                    <div>Country:</div>
                    <div class="font-bold">
                      {{ currentAddress.country }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <NuxtLink
              v-else
              to="/address"
              class="flex items-center text-blue-500 hover:text-[#f8d210]"
            >
              <Icon name="mdi:plus" size="18" class="mr-2" />
              Add New Address
            </NuxtLink>
          </div>

          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div v-for="product in userStore.checkout" :key="product.id">
              <CheckoutItem :product="product" />
            </div>
          </div>
        </div>

        <div class="md:hidden block my-4" />
        <div class="md:w-[35%]">
          <div id="PlaceOrder" class="bg-white rounded-lg p-4">
            <div class="text-2xl font-extrabold mb-2">Summary</div>

            <div class="flex items-center justify-between my-4">
              <div class="">Total Shipping</div>
              <div class="">Free</div>
            </div>

            <div class="border-t" />

            <div class="flex items-center justify-between my-4">
              <div class="font-semibold">Total</div>
              <div class="text-2xl font-semibold">
                $ <span class="font-extrabold">{{ total / 100 }}</span>
              </div>
            </div>

            <form @submit.prevent="pay()">
              <div id="card-element" class="border border-gray-500 p-2 rounded-sm" />

              <p id="card-error" role="alert" class="text-red-700 text-center font-semibold" />

              <button
                :disabled="isProcessing"
                type="submit"
                class="flex items-center justify-center bg-[#f8d210] w-full text-black border border-black text-[21px] font-semibold p-1.5 rounded-lg mt-4"
                :class="isProcessing ? 'opacity-70' : 'opacity-100'"
              >
                <Icon v-if="isProcessing" name="eos-icons:loading" />
                <div v-else>Place order</div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import Stripe from 'stripe'
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IAddress } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useAuthUser } from '~/composables/useAuthUser'

  const userStore = useUserStore()
  const user = ref(await useAuthUser())
  const route = useRoute()

  definePageMeta({ middleware: 'auth' })

  let stripe: any = null
  let clientSecret: string | null = ''
  let elements: any = null
  let card: any = null
  const total = ref(0)

  const currentAddress = ref<IAddress | null>(null)
  const isProcessing = ref(false)

  onBeforeMount(async () => {
    if (userStore.checkout.length < 1) {
      return navigateTo('/cart')
    }
    total.value = 0.0
    if (user.value && currentAddress.value) {
      const res = await useFetch<IAddress>(`/api/prisma/get-address-by-user/${user.value.id}`)
      currentAddress.value = res.data.value
      setTimeout(() => (userStore.isLoading = false), 200)
    }
  })

  onMounted(() => {
    if (!user.value) {
      return navigateTo('/auth')
    }
    isProcessing.value = true
    userStore.checkout.forEach((item) => {
      total.value += item.price
    })
  })

  watchEffect(() => {
    if (route.fullPath === '/checkout' && !user.value) {
      navigateTo('/auth')
    }
  })

  watch(
    () => total.value,
    () => {
      if (total.value > 0) {
        stripeInit()
      }
    }
  )

  const stripeInit = async () => {
    const runtimeConfig = useRuntimeConfig()
    stripe = new Stripe(runtimeConfig.public.stripePk, {
      apiVersion: '2024-06-20',
    })
    const res = await $fetch('/api/stripe/paymentintent', {
      method: 'POST',
      body: {
        amount: total.value,
      },
    })

    clientSecret = res.client_secret
    elements = stripe.elements()

    const style = {
      base: {
        fontSize: '18px',
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: '#EE4B2B',
        iconColor: '#EE4B2B',
      },
    }
    card = elements.create('card', {
      hidePostalCode: true,
      style,
    })

    card.mount('#card-element')
    card.on('change', function (event: any) {
      const button = document.querySelector('button')!
      const error = document.querySelector('#card-error')!
      error.textContent = event.error ? event.error.message : ''
      button.disabled = event.empty
    })

    isProcessing.value = false
  }

  const confirmPayment = () => {
    if (stripe.value) {
      return stripe.value.confirmPayment({
        elements: elements.value,
        confirmParams: {
          return_url: 'http://localhost:3000/success',
        },
      })
    }
  }

  const pay = () => {
    if (!currentAddress.value) {
      showError('Please add shipping address')
      return
    }
    isProcessing.value = true

    confirmPayment()

    const result = stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (result.error) {
      showError(result.error.message)
      isProcessing.value = false
    } else {
      createOrder(result.paymentIntent.id)
      userStore.cart = []
      userStore.checkout = []
      setTimeout(() => {
        return navigateTo('/success')
      }, 500)
    }
  }

  const createOrder = async (stripeId: string) => {
    if (user.value && currentAddress.value) {
      await useFetch('/api/prisma/create-order', {
        method: 'POST',
        body: {
          userId: user.value.id,
          stripeId,
          name: currentAddress.value.name,
          address: currentAddress.value.address,
          zipcode: currentAddress.value.zipCode,
          city: currentAddress.value.city,
          country: currentAddress.value.country,
          products: userStore.checkout,
        },
      })
    }
  }

  const showError = (errorMessage: string) => {
    const errorElement = document.querySelector('#card-error')!
    errorElement.textContent = errorMessage
    setTimeout(() => {
      errorElement.textContent = ''
    }, 4000)
  }
</script>
