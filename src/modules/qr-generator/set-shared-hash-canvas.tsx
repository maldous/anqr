import { setSharedHashCanvasState } from './shared-hash-canvas-state';

export function setSharedHashCanvas(value: HTMLCanvasElement | OffscreenCanvas | null) {
  setSharedHashCanvasState(value);
}
