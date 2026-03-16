import type { VectorModuleStyle, VectorTimingStyle } from "../../../modules/exporter/types";
import { generateTimingModulePath } from "./generate-timing-module-path";

export function buildSvgTimingPaths(
  matrix: boolean[][],
  moduleCount: number,
  marginPx: number,
  moduleSize: number,
  timingStyle: VectorTimingStyle,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number,
): string {
  let pathData = "";
  for (let col = 8; col < moduleCount - 8; col++) {
    if (matrix[6][col]) {
      const x = marginPx + col * moduleSize;
      const y = marginPx + 6 * moduleSize;
      pathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  for (let row = 8; row < moduleCount - 8; row++) {
    if (matrix[row][6]) {
      const x = marginPx + 6 * moduleSize;
      const y = marginPx + row * moduleSize;
      pathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  return pathData;
}
