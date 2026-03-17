export const uint8BufferPoolState = {
  buckets: new Map<number, Uint8Array[]>(),
  pooledBytes: 0,
};
