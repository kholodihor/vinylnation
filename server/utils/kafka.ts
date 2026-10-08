import { Kafka, logLevel, type Producer } from 'kafkajs'

let producerPromise: Promise<Producer | null> | null = null

async function connectProducer(): Promise<Producer | null> {
  const brokers = (process.env.KAFKA_BROKERS ?? '')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean)

  if (!brokers.length) {
    console.warn('KAFKA_BROKERS is not set, Kafka producer will be disabled')
    return null
  }

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'vinylnation-app',
    brokers,
    logLevel: logLevel.NOTHING,
  })
  const producer = kafka.producer()
  await producer.connect()
  return producer
}

/**
 * Fire-and-forget event publishing. Never throws: Kafka being unavailable
 * must not break checkout or product creation.
 */
export async function sendKafkaEvent(topic: string, key: string | null, value: unknown) {
  try {
    producerPromise ??= connectProducer()
    const producer = await producerPromise
    if (!producer) return

    await producer.send({
      topic,
      messages: [
        {
          key: key ?? undefined,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        },
      ],
    })
  } catch (err) {
    // Drop the cached connection so the next call retries
    producerPromise = null
    console.error('Failed to send Kafka event', err)
  }
}
