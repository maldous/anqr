const MAX_BUCKET_SIZE = 4;
const MAX_POOLED_LENGTH = 262_144; // 256KB buffers max
const MAX_TOTAL_POOLED_BYTES = 2 * 1024 * 1024; // 2MB

export function releaseUint8Buffer(
  buffer: Uint8Array,
  buckets: Map<number, Uint8Array[]>,
  pooledBytes: number,
  setPooledBytes: (next: number) => void
): void {
  if (buffer.length === 0 || buffer.length > MAX_POOLED_LENGTH) return;
  if (pooledBytes + buffer.length > MAX_TOTAL_POOLED_BYTES) return;

  let bucket = buckets.get(buffer.length);
  if (!bucket) {
    bucket = [];
    buckets.set(buffer.length, bucket);
  }
  if (bucket.length >= MAX_BUCKET_SIZE) return;

  bucket.push(buffer);
  setPooledBytes(pooledBytes + buffer.length);
}
