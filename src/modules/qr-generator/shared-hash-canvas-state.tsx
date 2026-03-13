let sharedHashCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

export function getSharedHashCanvasState() {
  return sharedHashCanvas;
}

export function setSharedHashCanvasState(value: HTMLCanvasElement | OffscreenCanvas | null) {
  sharedHashCanvas = value;
}
