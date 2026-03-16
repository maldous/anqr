import { decodeQRFromCanvas } from "./decoder";
import type { QRAnalysisResult } from "../../../modules/qr-analyzer/types";
import { nowMs } from "./now-ms";
import { withTotalAnalysisTiming } from "./with-total-analysis-timing";

/**
 * Analyze a QR code from a URL
 */
export async function analyzeQRFromUrl(url: string): Promise<QRAnalysisResult> {
  const startedAtMs = nowMs();
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const result = decodeQRFromCanvas(canvas);
        resolve(withTotalAnalysisTiming(result, startedAtMs));
      } else {
        resolve(
          withTotalAnalysisTiming(
            {
              success: false,
              error: "Could not get canvas context",
              errorType: "unknown",
              version: null,
              moduleCount: 0,
              eccLevel: null,
              maskPattern: null,
              encodingMode: null,
              errorsCorrected: null,
              estimatedModulePx: null,
            },
            startedAtMs,
          ),
        );
      }
    };

    img.onerror = () => {
      // Check if it's likely a CORS error
      resolve(
        withTotalAnalysisTiming(
          {
            success: false,
            error:
              "Failed to load image from URL. The server may be blocking cross-origin requests.",
            errorType: "cors_blocked",
            version: null,
            moduleCount: 0,
            eccLevel: null,
            maskPattern: null,
            encodingMode: null,
            errorsCorrected: null,
            estimatedModulePx: null,
          },
          startedAtMs,
        ),
      );
    };

    img.src = url;
  });
}
