import type { ReadbackCtx } from './readback-ctx';

export type SharedReadbackLease = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: ReadbackCtx;
  release: () => void;
};
