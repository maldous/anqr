import { uint8BufferPoolState } from './uint8-buffer-pool-state';
import { acquireUint8Buffer as acquireUint8BufferInternal } from './acquire-uint8-buffer';

export function acquireUint8Buffer(length: number, clear: boolean = true): Uint8Array {
  return acquireUint8BufferInternal(length, clear, uint8BufferPoolState.buckets, (bytes) => {
    uint8BufferPoolState.pooledBytes = Math.max(0, uint8BufferPoolState.pooledBytes - bytes);
  });
}
