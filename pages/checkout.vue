<template>
  <div>
    <div class="max-w-[1200px] mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-8">Checkout</h1>

      <div class="md:flex gap-8 justify-between">
        <div class="md:w-[65%]">
          <!-- Shipping Address Section -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold">Shipping Address</h2>
                <p class="text-sm text-gray-500 mt-1">Please ensure your address is correct</p>
              </div>
              <NuxtLink
                v-if="currentAddress"
                to="/address"
                class="text-sm flex items-center text-blue-500 hover:text-[#f8d210] transition-colors"
              >
                <Icon name="mdi:pencil" size="18" class="mr-1" />
                Edit
              </NuxtLink>
            </div>

            <div v-if="currentAddress" class="border-t border-gray-200 pt-4">
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-500 w-28">Contact name:</span>
                  <span class="font-medium text-gray-900">{{ currentAddress.name }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-500 w-28">Address:</span>
                  <span class="font-medium text-gray-900">{{ currentAddress.address }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-500 w-28">Zip Code:</span>
                  <span class="font-medium text-gray-900">{{ currentAddress.zipCode }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-500 w-28">City:</span>
                  <span class="font-medium text-gray-900">{{ currentAddress.city }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-500 w-28">Country:</span>
                  <span class="font-medium text-gray-900">{{ currentAddress.country }}</span>
                </div>
              </div>
            </div>

            <NuxtLink
              v-else
              to="/address"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Icon name="mdi:plus" size="18" class="mr-2" />
              Add New Address
            </NuxtLink>
          </div>

          <!-- Order Items Section -->
          <div class="bg-white rounded-lg p-6 mt-6 shadow-sm">
            <h2 class="text-xl font-semibold mb-4">Order Items</h2>
            <div class="divide-y divide-gray-200">
              <div v-for="product in userStore.cart" :key="product.id">
                <CheckoutItem :product="product" />
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Summary Section -->
        <div class="md:w-[35%] mt-6 md:mt-0">
          <div class="bg-white rounded-lg p-6 shadow-sm sticky top-4">
            <h2 class="text-xl font-semibold mb-6">Payment Summary</h2>

            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">${{ (total / 100).toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-green-600 font-medium">Free</span>
              </div>
              <div class="pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-gray-900 font-semibold">Total to pay</span>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ (total / 100).toFixed(2) }}
                    </div>
                    <div class="text-xs text-gray-500">Including VAT</div>
                  </div>
                </div>
              </div>
            </div>

            <form class="mt-6" @submit.prevent="pay()">
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <p class="font-medium mb-2 text-sm text-gray-700">Test Card Details:</p>
                <ul class="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Card number: 4242 4242 4242 4242</li>
                  <li>Expiry: Any future date (e.g., 12/25)</li>
                  <li>CVC: Any 3 digits</li>
                </ul>
              </div>

              <div
                id="card-element"
                class="border border-gray-300 p-3 rounded-lg mb-4 bg-white shadow-sm"
              ></div>

              <p
                id="card-error"
                role="alert"
                class="text-red-600 text-center text-sm font-medium min-h-[20px] mb-4"
              ></p>

              <button
                :disabled="isProcessing"
                type="submit"
                class="w-full flex items-center justify-center bg-[#f8d210] hover:bg-[#e5c20f] text-black font-semibold text-lg py-3 px-6 rounded-lg transition-colors"
                :class="isProcessing ? 'opacity-70 cursor-not-allowed' : 'opacity-100'"
              >
                <Icon v-if="isProcessing" name="eos-icons:loading" class="mr-2" />
                <span>{{ isProcessing ? 'Processing...' : 'Place Order' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { loadStripe } from '@stripe/stripe-js'
  import type { IAddress } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const user = useSupabaseUser()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()

  definePageMeta({ middleware: 'auth' })

  let stripe: any = null
  let elements: any = null
  let card: any = null
  let clientSecret: string | null = ''
  const total = ref(0)
  const currentAddress = ref<IAddress | null>(null)
  const isProcessing = ref(false)

  onBeforeMount(async () => {
    if (userStore.cart.length < 1) {
      return navigateTo('/cart')
    }

    // Calculate total from cart items
    total.value = userStore.cart.reduce((sum, item) => sum + item.price, 0)

    if (user.value) {
      const res = await useFetch<IAddress>(`/api/prisma/get-address-by-user/${user.value.id}`)
      currentAddress.value = res.data.value
      setTimeout(() => (userStore.isLoading = false), 200)
    }
  })

  onMounted(async () => {
    isProcessing.value = false
    if (total.value > 0) {
      await stripeInit()
    }
  })

  const stripeInit = async () => {
    try {
      // Initialize Stripe
      stripe = await loadStripe(runtimeConfig.public.stripePk)

      // Create payment intent
      const res = await $fetch('/api/stripe/paymentintent', {
        method: 'POST',
        body: {
          amount: total.value,
        },
      })

      clientSecret = res.client_secret

      // Create elements instance
      elements = stripe.elements()

      // Create and mount the card element
      const style = {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      }

      const cardElement = elements.create('card', { style })
      cardElement.mount('#card-element')

      // Handle real-time validation errors
      cardElement.on('change', (event: any) => {
        const displayError = document.getElementById('card-error')
        if (displayError) {
          displayError.textContent = event.error ? event.error.message : ''
        }
      })

      card = cardElement
    } catch (error) {
      console.error('Stripe initialization error:', error)
      showError('Failed to initialize payment system')
    }
  }

  watchEffect(() => {
    if (route.fullPath === '/checkout' && !user.value) {
      return navigateTo('/auth')
    }
  })

  const pay = async () => {
    if (!currentAddress.value) {
      showError('Please add shipping address')
      return
    }
    isProcessing.value = true

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (result.error) {
      showError(result.error.message)
      isProcessing.value = false
    } else {
      await createOrder(result.paymentIntent.id)
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
          products: userStore.cart,
        },
      })
    }
  }

  const showError = (errorMessage: string) => {
    const errorElement = document.getElementById('card-error')
    if (errorElement) {
      errorElement.textContent = errorMessage.includes('test mode')
        ? 'Please use the test card number shown above.'
        : errorMessage
      setTimeout(() => {
        errorElement.textContent = ''
      }, 6000)
    }
  }
</script>
