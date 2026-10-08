import type { Products } from '@prisma/client'

const TTL = 5 * 60 * 1000 // 5 minutes

let entry: { data: Products[]; expires: number } | null = null

export async function getAllProducts() {
  if (entry && entry.expires > Date.now()) {
    return { data: entry.data, hit: true }
  }
  const data = await prisma.products.findMany({ orderBy: { created_at: 'desc' } })
  entry = { data, expires: Date.now() + TTL }
  return { data, hit: false }
}

export function invalidateProducts() {
  entry = null
}
