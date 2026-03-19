import {
  getVersionFromModuleCount,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
} from "@/domain/qr/spec";
import type { VectorModuleStyle } from "../export-shared/types";
import { generateModulePath } from "./generate-module-path";

export function buildSvgDataPaths(
  matrix: boolean[][],
  moduleCount: number,
  marginPx: number,
  moduleSize: number,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number,
): string {
  let pathData = "";
  const version = getVersionFromModuleCount(moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col, moduleCount)) continue;
      if (isAlignmentPattern(row, col, moduleCount, version)) continue;
      if (isTimingPattern(row, col, moduleCount)) continue;

      if (matrix[row][col]) {
        const x = marginPx + col * moduleSize;
        const y = marginPx + row * moduleSize;
        pathData += `${generateModulePath(x, y, moduleSize, moduleStyle, cornerRadius)} `;
      }
    }
  }
  return pathData;
}
