import type { FullQArtResult } from "./generate.types";
export function buildQArtFailResult(
  error: string,
  matrix: boolean[][],
  moduleCount: number,
  version: number,
  mask: number,
  encodedData: string,
  originalData: string,
  suffix: string,
): FullQArtResult {
  return {
    success: false,
    error,
    matrix,
    moduleCount,
    version,
    maskPattern: mask,
    matchingPixels: 0,
    totalControllable: 0,
    matchPercentage: 0,
    encodedData,
    originalData,
    suffix,
  };
}
