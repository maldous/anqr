import { describe, it, expect } from "vitest";
import type { QRAnalysisResult } from "./qr-analysis-result.contract";

describe("contracts/analyze/qr-analysis-result", () => {
  describe("QRAnalysisResult", () => {
    it("accepts successful analysis result with minimal fields", () => {
      const result: QRAnalysisResult = {
        success: true,
        version: 5,
        moduleCount: 37,
        eccLevel: "H",
        maskPattern: 3,
        encodingMode: "byte",
        errorsCorrected: 2,
        estimatedModulePx: 10,
      };
      expect(result.success).toBe(true);
      expect(result.version).toBe(5);
      expect(result.moduleCount).toBe(37);
    });

    it("accepts failed analysis with error", () => {
      const result: QRAnalysisResult = {
        success: false,
        error: "No QR code detected",
        errorType: "no_qr_detected",
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        encodingMode: null,
        errorsCorrected: null,
        estimatedModulePx: null,
      };
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("no_qr_detected");
    });

    it("accepts all encoding modes", () => {
      const modes: Array<NonNullable<QRAnalysisResult["encodingMode"]>> = [
        "numeric",
        "alphanumeric",
        "byte",
        "kanji",
        "mixed",
        "unknown",
      ];
      for (const mode of modes) {
        const result: QRAnalysisResult = {
          success: true,
          version: 1,
          moduleCount: 21,
          eccLevel: "L",
          maskPattern: 0,
          encodingMode: mode,
          errorsCorrected: 0,
          estimatedModulePx: 5,
        };
        expect(result.encodingMode).toBe(mode);
      }
    });

    it("accepts all confidence levels", () => {
      const levels: Array<NonNullable<QRAnalysisResult["confidence"]>> = ["low", "medium", "high"];
      for (const level of levels) {
        const result: QRAnalysisResult = {
          success: true,
          confidence: level,
          version: 1,
          moduleCount: 21,
          eccLevel: "M",
          maskPattern: 1,
          encodingMode: "byte",
          errorsCorrected: 0,
          estimatedModulePx: 8,
        };
        expect(result.confidence).toBe(level);
      }
    });

    it("accepts comprehensive analysis with all optional fields", () => {
      const result: QRAnalysisResult = {
        success: true,
        confidence: "high",
        payload: "https://example.com",
        payloadBytes: new Uint8Array([104, 116, 116, 112, 115]),
        version: 10,
        moduleCount: 57,
        eccLevel: "Q",
        maskPattern: 2,
        encodingMode: "byte",
        errorsCorrected: 5,
        erasures: 0,
        orientation: 0,
        numBits: 1024,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        contentType: {
          type: "url",
          label: "Website URL",
          url: "https://example.com",
          protocol: "https",
        },
        detectedColors: {
          foreground: "#000000",
          background: "#ffffff",
          contrastRatio: 21,
        },
        dominantColors: [
          { color: "#000000", percentage: 60, rgb: { r: 0, g: 0, b: 0 } },
          { color: "#ffffff", percentage: 40, rgb: { r: 255, g: 255, b: 255 } },
        ],
        estimatedModulePx: 12,
        quietZone: { top: 4, right: 4, bottom: 4, left: 4, adequate: true },
        dataCapacity: { used: 512, total: 1024, percentage: 50, overflow: false },
        structuralAnalysis: {
          hasFinderPatterns: true,
          hasTimingPatterns: true,
          hasAlignmentPatterns: true,
          alignmentPatternCount: 5,
        },
        imageProperties: {
          width: 800,
          height: 800,
          aspectRatio: 1,
          estimatedQrSizePx: 600,
        },
        geometry: {
          corners: {
            topLeft: { x: 100, y: 100 },
            topRight: { x: 700, y: 100 },
            bottomLeft: { x: 100, y: 700 },
            bottomRight: { x: 700, y: 700 },
          },
          boundingBox: {
            minX: 100,
            minY: 100,
            maxX: 700,
            maxY: 700,
            width: 600,
            height: 600,
          },
          topEdgePx: 600,
          leftEdgePx: 600,
          estimatedRotationDeg: 0,
        },
        timing: {
          decodeMs: 50,
          totalAnalysisMs: 150,
        },
        warnings: ["Low contrast detected"],
        debugLog: "Analysis completed successfully",
      };
      expect(result.success).toBe(true);
      expect(result.payload).toBe("https://example.com");
      expect(result.dominantColors).toHaveLength(2);
    });

    it("accepts result with warnings", () => {
      const result: QRAnalysisResult = {
        success: true,
        warnings: ["Low quiet zone", "Contrast below recommended"],
        version: 3,
        moduleCount: 29,
        eccLevel: "M",
        maskPattern: 5,
        encodingMode: "alphanumeric",
        errorsCorrected: 1,
        estimatedModulePx: 7,
      };
      expect(result.warnings).toHaveLength(2);
    });

    it("accepts result with module matrix", () => {
      const matrix: boolean[][] = [
        [true, false, true],
        [false, true, false],
        [true, true, false],
      ];
      const result: QRAnalysisResult = {
        success: true,
        version: 1,
        moduleCount: 21,
        eccLevel: "L",
        maskPattern: 0,
        encodingMode: "numeric",
        errorsCorrected: 0,
        estimatedModulePx: 5,
        moduleMatrix: matrix,
      };
      expect(result.moduleMatrix).toHaveLength(3);
    });
  });
});
