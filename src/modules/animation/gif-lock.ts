/**
 * GIF encode lock
 * Serializes gifenc operations within a single JS runtime to avoid frame corruption
 * when multiple encodes run concurrently.
 */

type GifEncodeLockOptions = {
  onWait?: (waitMs: number, queueDepth: number) => void;
};

let gifEncodeQueue: Promise<void> = Promise.resolve();
let gifEncodeQueueDepth = 0;

export async function withGifEncodeLock<T>(
  fn: () => T | Promise<T>,
  options: GifEncodeLockOptions = {}
): Promise<T> {
  let release: () => void = () => {};
  const queuedAt = Date.now();
  gifEncodeQueueDepth += 1;
  const waitTurn = gifEncodeQueue;
  gifEncodeQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await waitTurn;
  const waitMs = Date.now() - queuedAt;
  options.onWait?.(waitMs, Math.max(0, gifEncodeQueueDepth - 1));

  try {
    return await fn();
  } finally {
    gifEncodeQueueDepth = Math.max(0, gifEncodeQueueDepth - 1);
    release();
  }
}

export function getGifEncodeQueueDepth(): number {
  return gifEncodeQueueDepth;
}
