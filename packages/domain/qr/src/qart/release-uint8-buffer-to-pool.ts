import { releaseUint8Buffer as releaseUint8BufferInternal } from "./release-uint8-buffer";
import { uint8BufferPoolState } from "./uint8-buffer-pool-state";

export function releaseUint8Buffer(buffer: Uint8Array): void {
  releaseUint8BufferInternal(
    buffer,
    uint8BufferPoolState.buckets,
    uint8BufferPoolState.pooledBytes,
    (next) => {
      uint8BufferPoolState.pooledBytes = next;
    },
  );
}
