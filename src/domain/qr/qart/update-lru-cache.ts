export function updateLruCache<K, V>(cache: Map<K, V>, key: K, value: V, limit: number): void {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size <= limit) return;
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
}
