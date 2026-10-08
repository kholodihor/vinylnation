/** Formats an integer amount of cents as dollars, e.g. 2599 -> "25.99" */
export function formatPrice(cents: number) {
  return (cents / 100).toFixed(2)
}
