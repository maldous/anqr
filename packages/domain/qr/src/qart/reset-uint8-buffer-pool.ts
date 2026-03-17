import { clearQArtBufferPool as clearQArtBufferPoolInternal } from "./clear-qart-buffer-pool";
import { uint8BufferPoolState } from "./uint8-buffer-pool-state";

export function clearQArtBufferPool(): void {
  clearQArtBufferPoolInternal(uint8BufferPoolState.buckets, () => {
    uint8BufferPoolState.pooledBytes = 0;
  });
}
