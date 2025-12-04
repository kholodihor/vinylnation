import { Kafka, logLevel, type Producer } from 'kafkajs'

let producer: Producer | null = null

function createKafkaProducer() {
  const brokersEnv = process.env.KAFKA_BROKERS
  if (!brokersEnv) {
    console.warn('KAFKA_BROKERS is not set, Kafka producer will be disabled')
    return null
  }

  const clientId = process.env.KAFKA_CLIENT_ID || 'vinylnation-app'
  const brokers = brokersEnv
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean)

  if (!brokers.length) {
    console.warn('KAFKA_BROKERS is empty after parsing, Kafka producer will be disabled')
    return null
  }

  const kafka = new Kafka({
    clientId,
    brokers,
    logLevel: logLevel.NOTHING,
  })

  return kafka.producer()
}

export async function getKafkaProducer() {
  if (!producer) {
    producer = createKafkaProducer()
    if (producer) {
      await producer.connect()
    }
  }
  return producer
}

export async function sendKafkaEvent(topic: string, key: string | null, value: any) {
  const p = await getKafkaProducer()
  if (!p) return

  const payload = typeof value === 'string' ? value : JSON.stringify(value)

  try {
    await p.send({
      topic,
      messages: [
        {
          key: key ?? undefined,
          value: payload,
        },
      ],
    })
  } catch (err) {
    console.error('Failed to send Kafka event', err)
  }
}
