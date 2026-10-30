import i18n from '../i18n';

/**
 * Returns human-readable relative time in natural Arabic or English.
 */
export function formatRelativeTime(timestamp: number, lng?: string): string {
  const currentLang = lng || i18n.language || 'ar';
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (currentLang.startsWith('en')) {
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1h ago';
    return `${diffHours}h ago`;
  }

  // Arabic
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
  return `منذ ${diffHours} ساعة`;
}
