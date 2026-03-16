import { type DecodedSegmentInfo, decodeQR } from "../decode";
import { renderMatrixToImageData } from "./render-matrix-to-image-data";
import { hasExtraInvalidSegments } from "./has-extra-invalid-segments";
import type { ScanResult } from "./scan-result";

export function scanMatrixWithJsQR(matrix: boolean[][]): ScanResult {
  const moduleCount = matrix.length;
  if (moduleCount === 0) {
    return { success: false, error: "Empty matrix" };
  }

  // Try multiple configurations for robustness
  const configs = [
    { scale: 4, quietZone: 4, invert: false },
    { scale: 8, quietZone: 8, invert: false },
    { scale: 2, quietZone: 4, invert: false },
    { scale: 4, quietZone: 4, invert: true },
  ];

  let lastError = "";
  let attempts = 0;

  for (const config of configs) {
    attempts++;
    const { scale, quietZone, invert } = config;

    try {
      const imageData = renderMatrixToImageData(matrix, moduleCount, scale, quietZone, invert);
      const result = decodeQR(imageData, {
        inversionAttempts: "attemptBoth",
      });

      if (result && result.data !== null) {
        // Extract segment info for structural validation
        const segments: DecodedSegmentInfo[] =
          result.segments?.map((s) => ({
            index: s.index,
            mode: s.mode,
            modeName: s.modeName,
            charCount: s.charCount,
            decodedLength: s.decodedLength,
            valid: s.valid,
            bitOffset: s.bitOffset,
          })) ?? [];

        // structurallyValid = decoder said valid AND no extra invalid segments detected
        const structurallyValid =
          (result.structurallyValid ?? true) && !hasExtraInvalidSegments(segments);

        return {
          success: true,
          data: result.data,
          attempts,
          structurallyValid,
          segmentCount: result.segmentCount ?? segments.length,
          segments,
        };
      }
      lastError = `Config ${attempts}: Decoder returned null`;
    } catch (err) {
      lastError = `Config ${attempts}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return {
    success: false,
    error: `All ${attempts} scan attempts failed. Last: ${lastError}`,
    attempts,
  };
}
