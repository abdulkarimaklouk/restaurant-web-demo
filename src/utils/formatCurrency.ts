import i18n from '../i18n';

/**
 * Format currency using locale-aware suffix (e.g. "90 ج.م" in Arabic, "90 EGP" in English).
 */
export function formatCurrency(amount: number, lng?: string): string {
  const currentLang = lng || i18n.language || 'ar';
  return currentLang.startsWith('en') ? `${amount} EGP` : `${amount} ج.م`;
}
