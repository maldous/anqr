/** Generate calendar subscription URL (webcal://) */
export function generateCalendarSubscription(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'webcal://');
  }
  if (url.startsWith('https://')) {
    return url.replace('https://', 'webcal://');
  }
  return `webcal://${url}`;
}
