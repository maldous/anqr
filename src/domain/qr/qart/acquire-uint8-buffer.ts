const MAX_POOLED_LENGTH = 262_144; // 256KB buffers max

export function acquireUint8Buffer(
  length: number,
  clear: boolean,
  buckets: Map<number, Uint8Array[]>,
  onAcquire: (bytes: number) => void
): Uint8Array {
  if (length <= 0) return new Uint8Array(0);
  if (length > MAX_POOLED_LENGTH) return new Uint8Array(length);
  const bucket = buckets.get(length);
  const buffer = bucket?.pop();
  if (buffer) {
    onAcquire(buffer.length);
    if (clear) buffer.fill(0);
    return buffer;
  }
  return new Uint8Array(length);
}
