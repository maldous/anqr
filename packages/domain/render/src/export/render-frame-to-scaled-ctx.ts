import type { ScaledCtx } from "./scaled-ctx";

export function renderFrameToScaledCtx(
  scaledCtx: ScaledCtx,
  frame: HTMLCanvasElement,
  width: number,
  height: number,
  hasBgOverride: string | undefined,
  bgOverride: string,
): void {
  scaledCtx.clearRect(0, 0, width, height);
  if (hasBgOverride) {
    scaledCtx.fillStyle = bgOverride;
    scaledCtx.fillRect(0, 0, width, height);
  }
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.drawImage(frame, 0, 0, width, height);
}
