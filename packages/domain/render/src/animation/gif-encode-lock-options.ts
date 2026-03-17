export type GifEncodeLockOptions = {
  onWait?: (waitMs: number, queueDepth: number) => void;
};
