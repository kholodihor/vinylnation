// Test to isolate the price formatting bug

const testPrice = 35
console.log('Original price:', testPrice)
console.log('toFixed(2):', testPrice.toFixed(2))
console.log('Template literal:', `$${testPrice.toFixed(2)}`)

const results = [{ price: 35 }]
const priceRange = {
  min: Math.min(...results.map((r) => r.price)),
  max: Math.max(...results.map((r) => r.price)),
}

console.log('Price range:', priceRange)
console.log('Min formatted:', priceRange.min.toFixed(2))
console.log('Max formatted:', priceRange.max.toFixed(2))
console.log(
  'Full message:',
  `Prices range from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}`
)

// Test what the actual API returns
async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/vapi/function', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'magnification' }),
    })

    const data = await response.json()
    const result = data.data.results[0]

    console.log('\nAPI Response:')
    console.log('Result price:', result.price, typeof result.price)
    console.log('Result priceDisplay:', result.priceDisplay)

    const apiPriceRange = {
      min: Math.min(...data.data.results.map((r) => r.price)),
      max: Math.max(...data.data.results.map((r) => r.price)),
    }

    console.log('API price range:', apiPriceRange)
    console.log('API min formatted:', apiPriceRange.min.toFixed(2))
    console.log('API summary message:', data.data.summary.message)
  } catch (error) {
    console.error('API test failed:', error.message)
  }
}

testAPI()
