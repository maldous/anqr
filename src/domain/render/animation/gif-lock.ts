/**
 * GIF encode lock
 * Serializes gifenc operations within a single JS runtime to avoid frame corruption
 * when multiple encodes run concurrently.
 */

import type { GifEncodeLockOptions } from './gif-encode-lock-options';
import { gifEncodeLockState } from './gif-lock-state';

export async function withGifEncodeLock<T>(
  fn: () => T | Promise<T>,
  options: GifEncodeLockOptions = {}
): Promise<T> {
  let release: () => void = () => {};
  const queuedAt = Date.now();
  gifEncodeLockState.depth += 1;
  const waitTurn = gifEncodeLockState.queue;
  gifEncodeLockState.queue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await waitTurn;
  const waitMs = Date.now() - queuedAt;
  options.onWait?.(waitMs, Math.max(0, gifEncodeLockState.depth - 1));

  try {
    return await fn();
  } finally {
    gifEncodeLockState.depth = Math.max(0, gifEncodeLockState.depth - 1);
    release();
  }
}
