import { shouldForceScaledBinaryModule } from "./should-force-scaled-binary-module";
import type { QRCodeInstance } from "@/modules/qr-generator/types";
import type { ScaledPreserveFlags } from "../scaled-render-types";

export function drawScaledStrictFunctionOverlay(
  ctx: CanvasRenderingContext2D,
  moduleCount: number,
  marginPx: number,
  effectiveModuleSize: number,
  qr: QRCodeInstance,
  effectiveFgColor: string,
  effectiveBgColor: string,
  functionalMap: Uint8Array,
  pf: ScaledPreserveFlags,
): void {
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!shouldForceScaledBinaryModule(functionalMap[row * moduleCount + col], pf)) continue;
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + row * effectiveModuleSize;
      ctx.fillStyle = qr.isDark(row, col) ? effectiveFgColor : effectiveBgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
  }
}
