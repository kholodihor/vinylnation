// Simple test script to verify Vapi integration with real data
// Run with: node test-vapi-integration.js

const testQueries = [
  'What products do you have?',
  'Show me albums under $30',
  'What genres are available?',
  'Tell me about your inventory',
  'What are your newest arrivals?',
]

export async function testVapiEndpoint(query) {
  try {
    console.log(`\n🔍 Testing query: "${query}"`)
    console.log('='.repeat(50))

    // Test the function endpoint (what Vapi calls)
    const response = await fetch('http://localhost:3000/api/vapi/function', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (data.success && data.data) {
      console.log('✅ Success!')
      console.log('📊 Results:', data.data.results?.length || 0, 'products found')
      console.log('💬 Summary:', data.data.summary?.message || 'No summary')

      if (data.data.results && data.data.results.length > 0) {
        console.log('\n📦 Sample products:')
        data.data.results.slice(0, 3).forEach((product, i) => {
          console.log(
            `  ${i + 1}. ${product.title} - ${product.priceDisplay} (${product.inStock} in stock)`
          )
        })
      }
    } else {
      console.log('❌ Error:', data.error || 'Unknown error')
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function testInventoryEndpoint() {
  try {
    console.log(`\n📋 Testing inventory endpoint`)
    console.log('='.repeat(50))

    const response = await fetch('http://localhost:3000/api/vapi/inventory')
    const data = await response.json()

    console.log('✅ Inventory loaded!')
    console.log('📊 Total products:', data.inventory?.totalProducts || 0)
    console.log('📦 In stock:', data.inventory?.inStockProducts || 0)
    console.log('🎵 Genres:', data.genres?.length || 0)
    console.log('💰 Price range: $' + data.pricing?.minPrice + ' - $' + data.pricing?.maxPrice)
    console.log('📝 Summary:', data.summary)
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Testing Vapi Integration with Real Data')
  console.log('Make sure your Nuxt dev server is running on localhost:3000\n')

  // Test inventory first
  await testInventoryEndpoint()

  // Test search queries
  for (const query of testQueries) {
    await testQueries(query)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second between tests
  }

  console.log('\n✨ Testing complete!')
  console.log('\nNext steps:')
  console.log('1. Make sure your Vapi assistant is configured to call these endpoints')
  console.log('2. Test the voice assistant with similar queries')
  console.log('3. Check that your database has product data')
}

// Run the tests
runTests().catch(console.error)
