import Stripe from 'stripe'

let stripe: Stripe | null = null

export function useStripe() {
  if (!stripe) {
    const { stripeSecretKey } = useRuntimeConfig()
    if (!stripeSecretKey) {
      throw createError({ statusCode: 500, message: 'STRIPE_SK_KEY is not configured' })
    }
    stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })
  }
  return stripe
}
