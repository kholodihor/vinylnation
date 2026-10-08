// Debug script to test Vapi search functionality
// Run with: node scripts/debug-vapi-search.js

async function testSearch(query) {
  console.log(`\n🔍 Testing: "${query}"`)
  console.log('='.repeat(50))

  try {
    // Test the products endpoint directly
    const response = await fetch(
      'http://localhost:3001/api/vapi/products?q=' + encodeURIComponent(query)
    )
    const data = await response.json()

    if (data.results) {
      console.log(`✅ Found ${data.results.length} products`)

      data.results.forEach((product, i) => {
        console.log(`${i + 1}. ${product.title}`)
        console.log(`   - Price: ${product.priceDisplay}`)
        console.log(`   - Quantity: ${product.inStock}`)
        console.log(`   - Available: ${product.available}`)
        console.log(`   - Genre: ${product.genre}`)
        console.log('')
      })

      console.log('📝 Summary:', data.summary.message)
    } else {
      console.log('❌ No results or error:', data)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function testFunction(query) {
  console.log(`\n🎯 Testing Function Call: "${query}"`)
  console.log('='.repeat(50))

  try {
    const response = await fetch('http://localhost:3001/api/vapi/function', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (data.success && data.data) {
      console.log('✅ Function call successful')
      console.log('📊 Results:', data.data.results?.length || 0, 'products')
      console.log('💬 Message:', data.data.summary?.message || 'No message')

      if (data.data.results && data.data.results.length > 0) {
        console.log('\n📦 Products found:')
        data.data.results.slice(0, 3).forEach((product, i) => {
          console.log(`  ${i + 1}. ${product.title} - ${product.priceDisplay}`)
          console.log(`     Stock: ${product.inStock}, Available: ${product.available}`)
        })
      }
    } else {
      console.log('❌ Function error:', data.error || 'Unknown error')
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Testing Vapi Search Functionality')
  console.log('Make sure your dev server is running on localhost:3001\n')

  const testQueries = [
    'pink floyd',
    'Pink Floyd albums',
    'magnification',
    'Yes magnification',
    'albums under $30',
    'jazz records',
  ]

  for (const query of testQueries) {
    await testSearch(query)
    await testFunction(query)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log('\n✨ Testing complete!')
}

runTests().catch(console.error)
