import Stripe from 'stripe'
import { sendKafkaEvent } from '../../utils/kafka'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const stripe = new Stripe(process.env.STRIPE_SK_KEY!, {
    apiVersion: '2024-06-20',
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(body.amount),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  })

  const topic = process.env.KAFKA_PAYMENTS_TOPIC || 'payments'

  await sendKafkaEvent(topic, paymentIntent.id, {
    type: 'payment.succeeded',
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    created: paymentIntent.created,
  })

  return paymentIntent
})
