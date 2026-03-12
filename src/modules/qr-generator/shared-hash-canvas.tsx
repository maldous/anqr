let sharedHashCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
export function getSharedHashCanvas() {
  return sharedHashCanvas;
}
export function setSharedHashCanvas(v: HTMLCanvasElement | OffscreenCanvas | null) {
  sharedHashCanvas = v;
}
