export function findOldestCacheKey<T extends { updatedAt: number }>(
  entries: IterableIterator<[string, T]>,
): string | null {
  let oldestKey: string | null = null;
  let oldestAt = Number.POSITIVE_INFINITY;

  for (const [key, value] of entries) {
    if (value.updatedAt < oldestAt) {
      oldestAt = value.updatedAt;
      oldestKey = key;
    }
  }

  return oldestKey;
}
