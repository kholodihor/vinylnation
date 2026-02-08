interface PerformanceMetrics {
  apiResponseTime: number
  cacheHitRate: number
  memoryUsage: NodeJS.MemoryUsage
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // Keep last 100 metrics

  startApiTimer(): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric('apiResponseTime', duration)
      return duration
    }
  }

  recordCacheHit(_hit: boolean): void {
    // Simple cache hit rate calculation
    const recentMetrics = this.metrics.slice(-10)
    const hits = recentMetrics.filter((m) => (m as any).cacheHit === true).length
    const hitRate = hits / recentMetrics.length
    this.recordMetric('cacheHitRate', hitRate)
  }

  recordMetric(type: keyof PerformanceMetrics, value: number): void {
    const metric: Partial<PerformanceMetrics> = {
      timestamp: Date.now(),
      [type]: value,
    }

    this.metrics.push(metric as PerformanceMetrics)

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageApiResponseTime(): number {
    const apiMetrics = this.metrics.filter((m) => m.apiResponseTime !== undefined)
    if (apiMetrics.length === 0) return 0
    return apiMetrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / apiMetrics.length
  }

  getAverageCacheHitRate(): number {
    const cacheMetrics = this.metrics.filter((m) => m.cacheHitRate !== undefined)
    if (cacheMetrics.length === 0) return 0
    return cacheMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / cacheMetrics.length
  }

  // Memory usage monitoring
  recordMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    this.recordMetric('memoryUsage', memUsage.heapUsed)
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Auto-record memory usage every 30 seconds
setInterval(() => {
  performanceMonitor.recordMemoryUsage()
}, 30000)
