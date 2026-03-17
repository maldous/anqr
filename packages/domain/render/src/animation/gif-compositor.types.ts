export interface GifCompositor {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  frameCount: number;
  width: number;
  height: number;
  delayMs: (i: number) => number;
  disposalType: (i: number) => number;
  frameDims: (i: number) => { left: number; top: number; width: number; height: number };
  apply: (i: number) => void;
  dispose: (i: number) => void;
  reset: () => void;
  getSnapshot: () => HTMLCanvasElement;
}
