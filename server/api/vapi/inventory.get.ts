import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    // Get inventory statistics and popular items
    const [totalProducts, inStockProducts, genres, recentProducts, popularProducts] =
      await Promise.all([
        prisma.products.count(),
        prisma.products.count({ where: { quantity: { gt: 0 } } }),
        prisma.products.groupBy({
          by: ['genre'],
          _count: { genre: true },
          orderBy: { _count: { genre: 'desc' } },
          take: 10,
        }),
        prisma.products.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          where: { quantity: { gt: 0 } },
        }),
        prisma.products.findMany({
          take: 5,
          orderBy: { quantity: 'desc' },
          where: { quantity: { gt: 0 } },
        }),
      ])

    const totalQuantity = await prisma.products.aggregate({
      _sum: { quantity: true },
      where: { quantity: { gt: 0 } },
    })

    const priceStats = await prisma.products.aggregate({
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
      where: { quantity: { gt: 0 } },
    })

    return {
      inventory: {
        totalProducts,
        inStockProducts,
        totalQuantity: totalQuantity._sum.quantity || 0,
        outOfStock: totalProducts - inStockProducts,
      },
      pricing: {
        minPrice: priceStats._min.price ? (priceStats._min.price / 100).toFixed(2) : '0.00',
        maxPrice: priceStats._max.price ? (priceStats._max.price / 100).toFixed(2) : '0.00',
        avgPrice: priceStats._avg.price ? (priceStats._avg.price / 100).toFixed(2) : '0.00',
      },
      genres: genres.map((g) => ({
        name: g.genre,
        count: g._count.genre,
      })),
      recentArrivals: recentProducts.map(formatProduct),
      popularItems: popularProducts.map(formatProduct),
      summary: generateInventorySummary({
        totalProducts,
        inStockProducts,
        totalQuantity: totalQuantity._sum.quantity || 0,
        genres: genres.length,
        minPrice: priceStats._min.price || 0,
        maxPrice: priceStats._max.price || 0,
      }),
    }
  } catch (error) {
    console.error('Inventory error:', error)
    throw createError({ statusCode: 500, message: 'Error fetching inventory' })
  } finally {
    await prisma.$disconnect()
  }
})

function formatProduct(product: any) {
  const titleParts = product.title.split(' - ')
  const artist = titleParts.length > 1 ? titleParts[0] : 'Various Artists'
  const album = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : product.title

  return {
    id: product.id,
    title: product.title,
    artist,
    album,
    genre: product.genre,
    price: `$${(product.price / 100).toFixed(2)}`,
    inStock: product.quantity,
    description: product.description,
  }
}

function generateInventorySummary(stats: any) {
  const { totalProducts, inStockProducts, totalQuantity, genres, minPrice, maxPrice } = stats

  return `We currently have ${totalProducts} products in our catalog with ${inStockProducts} items in stock (${totalQuantity} total units available). Our collection spans ${genres} different genres with prices ranging from $${(minPrice / 100).toFixed(2)} to $${(maxPrice / 100).toFixed(2)}. We regularly add new arrivals and maintain popular items in stock.`
}
