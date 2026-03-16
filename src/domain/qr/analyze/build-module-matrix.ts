import { createLogger } from "../../../infra/logging/logger";
import type { QRLocationCorners } from "./decoder-types";
import { sampleModulePixel } from "./sample-module-pixel";

const qrAnalyzerLog = createLogger("ANALYZER");

export function buildModuleMatrix(
  imageData: ImageData,
  location: QRLocationCorners,
  moduleCount: number,
  modulePx: number,
): boolean[][] | undefined {
  if (moduleCount <= 0) return undefined;

  const { data, width } = imageData;
  qrAnalyzerLog.trace("matrix: Building module matrix", {
    moduleCount,
    modulePx: modulePx.toFixed(3),
  });

  const tlX = location.topLeftCorner.x;
  const tlY = location.topLeftCorner.y;
  const trX = location.topRightCorner.x;
  const trY = location.topRightCorner.y;
  const blX = location.bottomLeftCorner.x;
  const blY = location.bottomLeftCorner.y;
  const moduleSpan = moduleCount - 7;

  if (moduleSpan <= 0) {
    qrAnalyzerLog.debug("matrix: Invalid module span", { moduleSpan });
    return undefined;
  }

  const rightVecX = (trX - tlX) / moduleSpan;
  const rightVecY = (trY - tlY) / moduleSpan;
  const downVecX = (blX - tlX) / moduleSpan;
  const downVecY = (blY - tlY) / moduleSpan;

  qrAnalyzerLog.trace("matrix: Direction vectors (per module)", {
    right: { x: rightVecX.toFixed(3), y: rightVecY.toFixed(3) },
    down: { x: downVecX.toFixed(3), y: downVecY.toFixed(3) },
  });

  const originX = tlX - 3.5 * rightVecX - 3.5 * downVecX;
  const originY = tlY - 3.5 * rightVecY - 3.5 * downVecY;

  qrAnalyzerLog.trace("matrix: Calculated origin (module 0,0)", {
    originX: originX.toFixed(2),
    originY: originY.toFixed(2),
  });

  const samplePositions = [
    { name: "module(0,0)", col: 0, row: 0 },
    { name: "module(3,3) - TL finder center", col: 3, row: 3 },
    { name: `module(${moduleCount - 4},3) - TR finder center`, col: moduleCount - 4, row: 3 },
    { name: `module(3,${moduleCount - 4}) - BL finder center`, col: 3, row: moduleCount - 4 },
  ];

  for (const sample of samplePositions) {
    const px = originX + (sample.col + 0.5) * rightVecX + (sample.row + 0.5) * downVecX;
    const py = originY + (sample.col + 0.5) * rightVecY + (sample.row + 0.5) * downVecY;
    qrAnalyzerLog.trace(`matrix: Sample ${sample.name}`, {
      pixelX: px.toFixed(2),
      pixelY: py.toFixed(2),
    });
  }

  const matrix: boolean[][] = [];
  let darkCount = 0;
  let lightCount = 0;
  let outOfBoundsCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      const x = Math.round(originX + (col + 0.5) * rightVecX + (row + 0.5) * downVecX);
      const y = Math.round(originY + (col + 0.5) * rightVecY + (row + 0.5) * downVecY);
      const sampled = sampleModulePixel(data, width, imageData.width, imageData.height, x, y);
      matrixRow.push(sampled.isDark);
      darkCount += sampled.dark;
      lightCount += sampled.light;
      outOfBoundsCount += sampled.oob;
    }
    matrix.push(matrixRow);
  }

  qrAnalyzerLog.trace("matrix: Matrix statistics", {
    totalModules: moduleCount * moduleCount,
    darkModules: darkCount,
    lightModules: lightCount,
    outOfBounds: outOfBoundsCount,
    darkRatio: `${((darkCount / (darkCount + lightCount)) * 100).toFixed(1)}%`,
  });

  return matrix;
}
