/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Draw source canvas to display canvas with DPR scaling.
 */

export function drawToDisplayCanvas(
  displayCanvas: HTMLCanvasElement,
  source: HTMLCanvasElement | OffscreenCanvas
): void {
  const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
  // Enforce a stable square preview surface regardless of upstream frame aspect.
  // QR output is expected to be square; if a non-square frame slips through
  // (e.g. transient worker/cache path), render it into a square viewport.
  const squareSize = Math.max(1, source.width, source.height);
  const cssWidth = squareSize;
  const cssHeight = squareSize;
  const backingWidth = Math.max(1, Math.round(cssWidth * dpr));
  const backingHeight = Math.max(1, Math.round(cssHeight * dpr));

  if (displayCanvas.width !== backingWidth) displayCanvas.width = backingWidth;
  if (displayCanvas.height !== backingHeight) displayCanvas.height = backingHeight;
  displayCanvas.style.width = `${cssWidth}px`;
  // Keep CSS scaling ratio-locked on resize (avoid independent max-width/max-height squish).
  displayCanvas.style.height = 'auto';

  const ctx = displayCanvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, backingWidth, backingHeight);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(source as CanvasImageSource, 0, 0, cssWidth, cssHeight);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

