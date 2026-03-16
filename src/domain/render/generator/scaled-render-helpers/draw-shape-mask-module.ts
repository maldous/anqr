import { drawModule } from "../drawing";
import type { QRGeneratorConfig } from "../../../../modules/qr-generator/types";

export function drawShapeMaskModule(
  maskCtx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  effectiveModuleSize: number,
  config: QRGeneratorConfig,
  moduleStyleName: string,
  cornerRadius: number,
  dotRotation: number,
): void {
  let gap = config.moduleGap ? (effectiveModuleSize * config.moduleGap) / 100 : 0;
  const gapMode = config.gapMode || "none";
  if (gapMode === "inset") gap = Math.max(gap, effectiveModuleSize * 0.1);
  else if (gapMode === "negative_space") gap = Math.max(gap, effectiveModuleSize * 0.2);
  const adjustedSize = effectiveModuleSize - gap;
  const offset = (effectiveModuleSize - adjustedSize) / 2;
  maskCtx.fillStyle = "white";
  drawModule(maskCtx, mx + offset, my + offset, adjustedSize, moduleStyleName, {
    cornerRadius,
    rotation: dotRotation,
  });
}
