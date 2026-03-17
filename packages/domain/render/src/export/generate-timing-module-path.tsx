import type { VectorModuleStyle, VectorTimingStyle } from "@/modules/exporter/types";
import { generateModulePath } from "./generate-module-path";

/**
 * Generate SVG path for timing pattern modules
 */
export function generateTimingModulePath(
  x: number,
  y: number,
  size: number,
  timingStyle: VectorTimingStyle,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number,
): string {
  if (timingStyle === "match_module") {
    return generateModulePath(x, y, size, moduleStyle, cornerRadius);
  }

  if (timingStyle === "solid") {
    return `M${x},${y}h${size}v${size}h${-size}Z`;
  }

  const dashSize = size * 0.7;
  const offset = (size - dashSize) / 2;
  return `M${x + offset},${y + offset}h${dashSize}v${dashSize}h${-dashSize}Z`;
}
