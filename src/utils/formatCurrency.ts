/**
 * Format currency using Western digits and the Egyptian Pound suffix in Arabic.
 * e.g., 90 -> "90 ج.م"
 */
export function formatCurrency(amount: number): string {
  return `${amount} ج.م`;
}

