export function resolveCleanupArea(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? Math.max(0, Math.floor(value)) : fallback;
}
