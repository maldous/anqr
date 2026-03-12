/**
 * Tiny typed-array pool used by QR-Art hot paths to reduce GC churn.
 * Kept intentionally small and size-bounded to avoid memory growth.
 */

const MAX_BUCKET_SIZE = 4;
const MAX_POOLED_LENGTH = 262_144; // 256KB buffers max
const MAX_TOTAL_POOLED_BYTES = 2 * 1024 * 1024; // 2MB

const uint8Buckets = new Map<number, Uint8Array[]>();
let pooledBytes = 0;

export function acquireUint8Buffer(length: number, clear: boolean = true): Uint8Array {
  if (length <= 0) return new Uint8Array(0);
  const bucket = uint8Buckets.get(length);
  const buffer = bucket?.pop();
  if (buffer) {
    pooledBytes = Math.max(0, pooledBytes - buffer.length);
    if (clear) buffer.fill(0);
    return buffer;
  }
  return new Uint8Array(length);
}

export function releaseUint8Buffer(buffer: Uint8Array): void {
  if (buffer.length === 0 || buffer.length > MAX_POOLED_LENGTH) return;
  if (pooledBytes + buffer.length > MAX_TOTAL_POOLED_BYTES) return;

  let bucket = uint8Buckets.get(buffer.length);
  if (!bucket) {
    bucket = [];
    uint8Buckets.set(buffer.length, bucket);
  }
  if (bucket.length >= MAX_BUCKET_SIZE) return;

  bucket.push(buffer);
  pooledBytes += buffer.length;
}

export function clearQArtBufferPool(): void {
  uint8Buckets.clear();
  pooledBytes = 0;
}
