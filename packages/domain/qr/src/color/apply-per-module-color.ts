import { applyPerModuleColor as applyRenderPerModuleColor } from "@/domain/render/generator";
import type { QRGeneratorConfig } from "../generator-types";
import type { OverlayData } from "../cache/overlay-data-matrix";

export function applyPerModuleColor(
  mode: string,
  baseColor: string,
  overlayData: OverlayData,
  row: number,
  col: number,
  moduleCount: number,
  config: QRGeneratorConfig,
): string {
  return applyRenderPerModuleColor(mode, baseColor, overlayData, row, col, moduleCount, config);
}
