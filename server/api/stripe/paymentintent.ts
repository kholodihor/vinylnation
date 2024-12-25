import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const stripe = new Stripe(process.env.STRIPE_SK_KEY!, {
    apiVersion: '2022-11-15',
  })

  return await stripe.paymentIntents.create({
    amount: Number(body.amount),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  })
})
