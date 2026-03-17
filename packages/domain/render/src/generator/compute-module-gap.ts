import type { QRGeneratorConfig } from "@/modules/qr-generator/types";

export function computeModuleGap(
  config: QRGeneratorConfig,
  moduleSize: number,
): { gap: number; strokeWidth: number; isStrokeGapMode: boolean } {
  const baseGap = config.moduleGap ? (moduleSize * config.moduleGap) / 100 : 0;
  const gapMode = config.gapMode || "none";
  let gap = baseGap;
  let strokeWidth = 0;
  if (gapMode === "inset") {
    gap = Math.max(baseGap, moduleSize * 0.1);
  } else if (gapMode === "stroke") {
    strokeWidth = Math.max(1, moduleSize * 0.15);
    gap = strokeWidth;
  } else if (gapMode === "negative_space") {
    gap = Math.max(baseGap, moduleSize * 0.2);
  }
  return { gap, strokeWidth, isStrokeGapMode: gapMode === "stroke" };
}
