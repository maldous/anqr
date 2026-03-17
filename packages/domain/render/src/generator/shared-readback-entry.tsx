import type { CreateCanvasFn } from "./types";
import type { ReadbackCtx } from "./readback-ctx";

export type SharedReadbackEntry = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: ReadbackCtx;
  createCanvasFn: CreateCanvasFn;
  inUse: boolean;
  lastUsedAt: number;
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
};
