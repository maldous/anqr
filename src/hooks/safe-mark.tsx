export function safeMark(name: string): void {
  if (typeof performance === 'undefined') return;
  try {
    performance.mark(name);
  } catch {
    // Ignore performance API failures
  }
}
