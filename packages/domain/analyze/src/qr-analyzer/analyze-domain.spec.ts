import { describe, it, expect } from "vitest";
import { buildAnalysisExportData } from "./export";
import type { QRAnalysisResult } from "./qr-analysis-result";
import * as qrAnalyzerIndex from "./index";
import * as domainIndex from "../index";

function minimalResult(): QRAnalysisResult {
  return {
    success: false,
    version: null,
    moduleCount: 0,
    eccLevel: null,
    maskPattern: null,
    encodingMode: null,
    errorsCorrected: null,
    estimatedModulePx: null,
  };
}

function fullResult(): QRAnalysisResult {
  return {
    success: true,
    payload: "https://anqr.app",
    payloadBytes: new Uint8Array([104, 116, 116, 112, 115]),
    version: 5,
    moduleCount: 37,
    eccLevel: "H",
    maskPattern: 3,
    encodingMode: "byte",
    errorsCorrected: 2,
    estimatedModulePx: 10,
    confidence: "high",
    warnings: ["Low contrast detected"],
    contentType: {
      type: "url",
      label: "URL",
    },
    detectedColors: {
      foreground: "#000000",
      background: "#ffffff",
      contrastRatio: 21,
    },
    dominantColors: [{ color: "#000000", percentage: 50, rgb: { r: 0, g: 0, b: 0 } }],
    quietZone: {
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
      adequate: true,
    },
    dataCapacity: {
      used: 50,
      total: 100,
      percentage: 50,
      overflow: false,
    },
    structuralAnalysis: {
      hasFinderPatterns: true,
      hasTimingPatterns: true,
      hasAlignmentPatterns: true,
      alignmentPatternCount: 1,
    },
    imageProperties: {
      width: 370,
      height: 370,
      aspectRatio: 1,
      estimatedQrSizePx: 350,
    },
    geometry: {
      corners: {
        topLeft: { x: 10, y: 10 },
        topRight: { x: 360, y: 10 },
        bottomLeft: { x: 10, y: 360 },
        bottomRight: { x: 360, y: 360 },
      },
      boundingBox: {
        minX: 10,
        minY: 10,
        maxX: 360,
        maxY: 360,
        width: 350,
        height: 350,
      },
      topEdgePx: 10,
      leftEdgePx: 10,
      estimatedRotationDeg: 0,
    },
    timing: {
      decodeMs: 15,
      totalAnalysisMs: 50,
      encodeMs: 10,
      renderMs: 5,
      exportMs: 2,
    },
    decoderMetadata: {
      version: 5,
      maskPattern: 3,
      eccLevel: "H",
      errorsCorrected: 2,
      erasures: 0,
      numBits: 480,
      orientation: 0,
      structuredAppendSequence: null,
      structuredAppendParity: null,
      hasStructuredAppend: false,
      byteSegmentCount: 1,
      totalByteLength: 19,
    },
    moduleMatrix: [
      [true, false, true],
      [false, true, false],
    ],
  };
}

describe("domain/analyze", () => {
  describe("buildAnalysisExportData", () => {
    it("produces valid export data from a minimal failed result", () => {
      const result = minimalResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.version).toBe("1.1");
      expect(data.timestamp).toBe("2024-01-01T00:00:00Z");
      expect(data.source).toBe("unknown");
      expect(data.analysis.version).toBeNull();
      expect(data.analysis.moduleCount).toBe(0);
      expect(data.analysis.eccLevel).toBeNull();
      expect(data.analysis.maskPattern).toBeNull();
      expect(data.analysis.encodingMode).toBeNull();
      expect(data.analysis.errorsCorrected).toBeNull();
      expect(data.diagnostics.summary.scannable).toBe(false);
      expect(data.diagnostics.summary.hasQuietZone).toBe(false);
      expect(data.diagnostics.summary.quietZoneAdequate).toBe(false);
    });

    it("produces full export data from a successful analysis result", () => {
      const result = fullResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-06-15T12:00:00Z",
        source: "generator",
        actualUsedVersion: 5,
      });

      expect(data.version).toBe("1.1");
      expect(data.timestamp).toBe("2024-06-15T12:00:00Z");
      expect(data.source).toBe("generator");
      expect(data.analysis.payload).toBe("https://anqr.app");
      expect(data.analysis.payloadBytes).toEqual([104, 116, 116, 112, 115]);
      expect(data.analysis.version).toBe(5);
      expect(data.analysis.moduleCount).toBe(37);
      expect(data.analysis.eccLevel).toBe("H");
      expect(data.analysis.maskPattern).toBe(3);
      expect(data.analysis.encodingMode).toBe("byte");
      expect(data.analysis.confidence).toBe("high");
      expect(data.analysis.warnings).toEqual(["Low contrast detected"]);
      expect(data.analysis.estimatedModulePx).toBe(10);
      expect(data.analysis.errorsCorrected).toBe(2);
      expect(data.diagnostics.summary.scannable).toBe(true);
      expect(data.diagnostics.summary.hasQuietZone).toBe(true);
      expect(data.diagnostics.summary.quietZoneAdequate).toBe(true);
      expect(data.diagnostics.summary.contrastRatio).toBe(21);
      expect(data.diagnostics.summary.estimatedRotationDeg).toBe(0);
      expect(data.diagnostics.summary.decodeMs).toBe(15);
      expect(data.diagnostics.summary.totalAnalysisMs).toBe(50);
    });

    it("converts moduleMatrix booleans to 1/0 strings", () => {
      const result = fullResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.analysis.moduleMatrix).toEqual(["101", "010"]);
    });

    it("omits moduleMatrix when not present", () => {
      const result = minimalResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.analysis.moduleMatrix).toBeUndefined();
    });

    it("uses actualUsedVersion in generator settings when provided", () => {
      const result = fullResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
        actualUsedVersion: 10,
      });

      expect(data.generatorSettings.version).toBe(10);
    });

    it("falls back to result.version when actualUsedVersion is not provided", () => {
      const result = fullResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.generatorSettings.version).toBe(5);
    });

    it("populates generatorSettings from analysis result", () => {
      const result = fullResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.generatorSettings.text).toBe("https://anqr.app");
      expect(data.generatorSettings.ecc).toBe("H");
      expect(data.generatorSettings.maskPattern).toBe(3);
      expect(data.generatorSettings.encodingMode).toBe("byte");
      expect(data.generatorSettings.fgColor).toBe("#000000");
      expect(data.generatorSettings.bgColor).toBe("#ffffff");
    });

    it("excludes 'unknown' and 'mixed' encoding modes from generator settings", () => {
      const result = fullResult();
      result.encodingMode = "unknown";
      const data1 = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });
      expect(data1.generatorSettings.encodingMode).toBeUndefined();

      result.encodingMode = "mixed";
      const data2 = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });
      expect(data2.generatorSettings.encodingMode).toBeUndefined();
    });

    it("defaults source to 'unknown' when not specified", () => {
      const result = minimalResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.source).toBe("unknown");
    });

    it("accepts all valid source types", () => {
      const sources = ["file", "url", "camera", "generator"] as const;
      for (const source of sources) {
        const data = buildAnalysisExportData(minimalResult(), {
          timestamp: "2024-01-01T00:00:00Z",
          source,
        });
        expect(data.source).toBe(source);
      }
    });

    it("generates timestamp when not provided", () => {
      const data = buildAnalysisExportData(minimalResult());
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("handles null timing fields gracefully", () => {
      const result = minimalResult();
      const data = buildAnalysisExportData(result, {
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(data.diagnostics.summary.decodeMs).toBeNull();
      expect(data.diagnostics.summary.totalAnalysisMs).toBeNull();
      expect(data.diagnostics.summary.encodeMs).toBeNull();
      expect(data.diagnostics.summary.renderMs).toBeNull();
      expect(data.diagnostics.summary.exportMs).toBeNull();
    });
  });

  describe("qr-analyzer index re-exports", () => {
    it("exports buildAnalysisExportData as a function", () => {
      expect(typeof qrAnalyzerIndex.buildAnalysisExportData).toBe("function");
    });

    it("has exactly 1 runtime export", () => {
      const runtimeExports = Object.keys(qrAnalyzerIndex).filter(
        (k) => typeof (qrAnalyzerIndex as Record<string, unknown>)[k] === "function",
      );
      expect(runtimeExports).toEqual(["buildAnalysisExportData"]);
    });
  });

  describe("domain/analyze index re-exports", () => {
    it("exports buildAnalysisExportData", () => {
      expect(typeof domainIndex.buildAnalysisExportData).toBe("function");
    });

    it("has exactly 1 runtime export", () => {
      const runtimeExports = Object.keys(domainIndex).filter(
        (k) => typeof (domainIndex as Record<string, unknown>)[k] === "function",
      );
      expect(runtimeExports).toEqual(["buildAnalysisExportData"]);
    });
  });
});
