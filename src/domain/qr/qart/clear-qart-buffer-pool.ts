export function clearQArtBufferPool(
  buckets: Map<number, Uint8Array[]>,
  resetPooledBytes: () => void
): void {
  buckets.clear();
  resetPooledBytes();
}
