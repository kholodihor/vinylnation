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
                  <span class="font-medium text-gray-900">{{ currentAddress.zipcode }}</span>
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
              <CheckoutItem v-for="product in items" :key="product.id" :product="product" />
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
                <span class="font-medium">${{ formatPrice(total) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-green-600 font-medium">Free</span>
              </div>
              <div class="pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-gray-900 font-semibold">Total to pay</span>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900">${{ formatPrice(total) }}</div>
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
                ref="cardElementRef"
                class="border border-gray-300 p-3 rounded-lg mb-4 bg-white shadow-sm"
              ></div>

              <p
                role="alert"
                class="text-red-600 text-center text-sm font-medium min-h-[20px] mb-4"
              >
                {{ errorMessage }}
              </p>

              <button
                :disabled="isProcessing || !card"
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
  import type { Stripe, StripeCardElement } from '@stripe/stripe-js'
  import type { IAddress } from '~/types'

  const userStore = useUserStore()
  const runtimeConfig = useRuntimeConfig()

  const items = computed(() => userStore.checkout)
  const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))

  const { data: currentAddress } = await useFetch<IAddress | null>('/api/address')

  const cardElementRef = ref<HTMLElement | null>(null)
  const card = shallowRef<StripeCardElement | null>(null)
  const errorMessage = ref('')
  const isProcessing = ref(false)

  let stripe: Stripe | null = null
  let clientSecret: string | null = null
  let errorTimer: ReturnType<typeof setTimeout> | undefined

  const showError = (message: string) => {
    errorMessage.value = message.includes('test mode')
      ? 'Please use the test card number shown above.'
      : message
    clearTimeout(errorTimer)
    errorTimer = setTimeout(() => (errorMessage.value = ''), 6000)
  }

  onMounted(async () => {
    // Checkout state lives in localStorage, so this check is client-only
    if (!items.value.length) {
      return navigateTo('/cart')
    }

    try {
      stripe = await loadStripe(runtimeConfig.public.stripePk as string)
      if (!stripe) throw new Error('Stripe failed to load')

      const res = await $fetch('/api/stripe/payment-intent', {
        method: 'POST',
        body: { productIds: items.value.map((item) => item.id) },
      })
      clientSecret = res.clientSecret

      const cardElement = stripe.elements().create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': { color: '#aab7c4' },
          },
          invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
      })
      cardElement.mount(cardElementRef.value!)
      cardElement.on('change', (event) => {
        errorMessage.value = event.error?.message ?? ''
      })
      card.value = cardElement
    } catch (error: any) {
      console.error('Stripe initialization error:', error)
      showError(error?.data?.message || 'Failed to initialize payment system')
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(errorTimer)
    card.value?.destroy()
  })

  const pay = async () => {
    if (!currentAddress.value) {
      showError('Please add shipping address')
      return
    }
    if (!stripe || !card.value || !clientSecret) return

    isProcessing.value = true
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card.value },
      })
      if (result.error) {
        showError(result.error.message ?? 'Payment failed')
        return
      }

      await $fetch('/api/orders', {
        method: 'POST',
        body: { paymentIntentId: result.paymentIntent.id },
      })
      userStore.completeCheckout()
      await navigateTo('/success')
    } catch (error: any) {
      console.error('Order error:', error)
      showError(error?.data?.message || 'Payment succeeded but the order could not be saved')
    } finally {
      isProcessing.value = false
    }
  }
</script>
