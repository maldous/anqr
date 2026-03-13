import { gifEncodeLockState } from './gif-lock-state';

export function _getGifEncodeQueueDepth(): number {
  return gifEncodeLockState.depth;
}
