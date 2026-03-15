import { sharedHashCanvasState } from './shared-hash-canvas-state';

export function setSharedHashCanvas(value: HTMLCanvasElement | OffscreenCanvas | null) {
  sharedHashCanvasState.current = value;
}
