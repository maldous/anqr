import { renderRunLengthPass } from "./render-run-length-pass";
import type { FastPathCanvasContext } from "./fast-path-canvas-context.types";
import type { QRCodeInstance } from "@/modules/qr-generator/types";

export function renderModulesFastPath(
  ctx: FastPathCanvasContext,
  qr: QRCodeInstance,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  fgFill: string | CanvasGradient,
  bgColor: string,
  needsExplicitLightModules: boolean,
): void {
  ctx.fillStyle = fgFill;
  renderRunLengthPass(ctx, qr, moduleCount, moduleSize, margin, ditherPattern, skipMask, true);
  if (!needsExplicitLightModules) return;
  ctx.fillStyle = bgColor;
  renderRunLengthPass(ctx, qr, moduleCount, moduleSize, margin, ditherPattern, skipMask, false);
}
