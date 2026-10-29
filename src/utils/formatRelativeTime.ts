/**
 * Returns human-readable relative time in natural Arabic.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
  return `منذ ${diffHours} ساعة`;
}

