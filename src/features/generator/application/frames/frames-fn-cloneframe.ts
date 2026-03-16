/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Clone canvas to new canvas element.
 */

export function cloneCanvasFrame(
  source: HTMLCanvasElement | OffscreenCanvas,
  targetCanvas?: HTMLCanvasElement | null,
): HTMLCanvasElement {
  const cloned = targetCanvas ?? document.createElement("canvas");
  cloned.width = source.width;
  cloned.height = source.height;
  const ctx = cloned.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to clone generated artwork frame");
  }
  ctx.clearRect(0, 0, cloned.width, cloned.height);
  ctx.drawImage(source, 0, 0);
  return cloned;
}
