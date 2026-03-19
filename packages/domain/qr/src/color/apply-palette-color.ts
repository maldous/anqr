import { applyPaletteColor as applyRenderPaletteColor } from "@/domain/render/generator";
import type { QRGeneratorConfig } from "../generator-types";

export function applyPaletteColor(
  row: number,
  col: number,
  moduleCount: number,
  brightness: number,
  palette: string[],
  config: QRGeneratorConfig,
): string {
  return applyRenderPaletteColor(row, col, moduleCount, brightness, palette, config);
}
