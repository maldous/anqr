import { describe, it, expect } from "vitest";
import type { ContentType } from "./content-type.contract";
import type { ContentTypeDetails } from "./content-type-details.contract";
import type { DataCapacity } from "./data-capacity.contract";
import type { DecoderMetadata } from "./decoder-metadata.contract";
import type { DetectedColors } from "./detected-colors.contract";
import type { DominantColorInfo } from "./dominant-color-info.contract";
import type { ECCLevel } from "./ecc-level.contract";
import type { ErrorType } from "./error-type.contract";
import type { GeometryDiagnostics } from "./geometry-diagnostics.contract";
import type { ImageProperties } from "./image-properties.contract";
import type { QRAnalysisResult } from "./qr-analysis-result.contract";
import type { QRLocation } from "./qr-location.contract";
import type { QuietZoneInfo } from "./quiet-zone-info.contract";
import type { ScanResult } from "./scan-result.contract";
import type { StructuralAnalysis } from "./structural-analysis.contract";
import type { TimingDiagnostics } from "./timing-diagnostics.contract";
import type { ValidationResult } from "./validation-result.contract";
import * as indexExports from "./index";

describe("contracts/analyze", () => {
  describe("ContentType", () => {
    it("accepts all 19 content type members", () => {
      const members: ContentType[] = [
        "url",
        "wifi",
        "vcard",
        "mecard",
        "email",
        "tel",
        "sms",
        "geo",
        "crypto_bitcoin",
        "crypto_ethereum",
        "crypto_other",
        "epc_sepa",
        "upi",
        "emv_qr",
        "swiss_qr_bill",
        "calendar_event",
        "otp_auth",
        "plain_text",
        "unknown",
      ];
      expect(new Set(members).size).toBe(19);
    });
  });

  describe("ErrorType", () => {
    it("accepts all 4 error type members", () => {
      const members: ErrorType[] = ["no_qr_detected", "cors_blocked", "decode_error", "unknown"];
      expect(new Set(members).size).toBe(4);
    });
  });

  describe("ECCLevel (re-export)", () => {
    it("accepts all 4 ECC levels", () => {
      const levels: ECCLevel[] = ["L", "M", "Q", "H"];
      expect(new Set(levels).size).toBe(4);
    });
  });

  describe("ContentTypeDetails", () => {
    it("accepts a minimal content type details with only required fields", () => {
      const details: ContentTypeDetails = { type: "url", label: "URL" };
      expect(details.type).toBe("url");
      expect(details.label).toBe("URL");
    });

    it("accepts a full content type details with all optional fields", () => {
      const details: ContentTypeDetails = {
        type: "crypto_bitcoin",
        label: "Bitcoin",
        // cspell:disable-next-line
        url: "bitcoin:14qViLJfdGaP4EeHnDyJbEGQysnCpwk3gd",
        protocol: "bitcoin",
        wifiSsid: undefined,
        wifiAuth: undefined,
        contactName: undefined,
        phoneNumber: undefined,
        emailAddress: undefined,
        cryptoCurrency: "BTC",
        // cspell:disable-next-line
        cryptoAddress: "14qViLJfdGaP4EeHnDyJbEGQysnCpwk3gd",
        amount: "0.001",
        hasUtmParams: false,
        utmSource: undefined,
        utmMedium: undefined,
        utmCampaign: undefined,
      };
      expect(details.cryptoCurrency).toBe("BTC");
    });

    it("accepts UTM-enriched URL details", () => {
      const details: ContentTypeDetails = {
        type: "url",
        label: "URL with tracking",
        url: "https://example.com?utm_source=qr",
        hasUtmParams: true,
        utmSource: "qr",
        utmMedium: "print",
        utmCampaign: "launch",
      };
      expect(details.hasUtmParams).toBe(true);
    });
  });

  describe("DataCapacity", () => {
    it("accepts a normal capacity", () => {
      const cap: DataCapacity = { used: 50, total: 100, percentage: 50, overflow: false };
      expect(cap.overflow).toBe(false);
    });

    it("represents overflow when data exceeds capacity", () => {
      const cap: DataCapacity = { used: 150, total: 100, percentage: 150, overflow: true };
      expect(cap.overflow).toBe(true);
    });
  });

  describe("DecoderMetadata", () => {
    it("accepts a fully populated decoder result", () => {
      const meta: DecoderMetadata = {
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
        totalByteLength: 42,
      };
      expect(meta.version).toBe(5);
      expect(meta.hasStructuredAppend).toBe(false);
    });

    it("accepts null values for fields that could not be parsed", () => {
      const meta: DecoderMetadata = {
        version: null,
        maskPattern: null,
        eccLevel: null,
        errorsCorrected: null,
        erasures: null,
        numBits: null,
        orientation: null,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        hasStructuredAppend: false,
        byteSegmentCount: 0,
        totalByteLength: 0,
      };
      expect(meta.version).toBeNull();
      expect(meta.eccLevel).toBeNull();
    });

    it("accepts all valid ECC levels in eccLevel field", () => {
      const levels = ["L", "M", "Q", "H"] as const;
      for (const level of levels) {
        const meta: DecoderMetadata = {
          version: 1,
          maskPattern: 0,
          eccLevel: level,
          errorsCorrected: 0,
          erasures: 0,
          numBits: 0,
          orientation: 0,
          structuredAppendSequence: null,
          structuredAppendParity: null,
          hasStructuredAppend: false,
          byteSegmentCount: 0,
          totalByteLength: 0,
        };
        expect(meta.eccLevel).toBe(level);
      }
    });
  });

  describe("DetectedColors", () => {
    it("stores foreground, background, and contrast ratio", () => {
      const colors: DetectedColors = {
        foreground: "#000000",
        background: "#ffffff",
        contrastRatio: 21,
      };
      expect(colors.contrastRatio).toBe(21);
    });
  });

  describe("DominantColorInfo", () => {
    it("stores color, percentage, and rgb breakdown", () => {
      const info: DominantColorInfo = {
        color: "#ff0000",
        percentage: 45.5,
        rgb: { r: 255, g: 0, b: 0 },
      };
      expect(info.rgb.r).toBe(255);
      expect(info.percentage).toBe(45.5);
    });
  });

  describe("GeometryDiagnostics", () => {
    it("accepts a complete geometry diagnostic", () => {
      const geo: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 100, y: 0 },
          bottomLeft: { x: 0, y: 100 },
          bottomRight: { x: 100, y: 100 },
        },
        boundingBox: {
          minX: 0,
          minY: 0,
          maxX: 100,
          maxY: 100,
          width: 100,
          height: 100,
        },
        topEdgePx: 0,
        leftEdgePx: 0,
        estimatedRotationDeg: 0,
      };
      expect(geo.corners.topLeft).toEqual({ x: 0, y: 0 });
      expect(geo.boundingBox.width).toBe(100);
    });

    it("represents rotated QR codes", () => {
      const geo: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 10, y: 5 },
          topRight: { x: 105, y: 12 },
          bottomLeft: { x: 3, y: 98 },
          bottomRight: { x: 98, y: 105 },
        },
        boundingBox: {
          minX: 3,
          minY: 5,
          maxX: 105,
          maxY: 105,
          width: 102,
          height: 100,
        },
        topEdgePx: 5,
        leftEdgePx: 3,
        estimatedRotationDeg: 4.2,
      };
      expect(geo.estimatedRotationDeg).toBeCloseTo(4.2);
    });
  });

  describe("ImageProperties", () => {
    it("stores image dimensions and QR size estimate", () => {
      const props: ImageProperties = {
        width: 400,
        height: 400,
        aspectRatio: 1,
        estimatedQrSizePx: 380,
      };
      expect(props.aspectRatio).toBe(1);
    });
  });

  describe("QRLocation", () => {
    it("stores four corner coordinates", () => {
      const loc: QRLocation = {
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 100, y: 0 },
        bottomLeftCorner: { x: 0, y: 100 },
        bottomRightCorner: { x: 100, y: 100 },
      };
      expect(loc.topLeftCorner.x).toBe(0);
      expect(loc.bottomRightCorner.y).toBe(100);
    });
  });

  describe("QuietZoneInfo", () => {
    it("reports adequate quiet zone", () => {
      const qz: QuietZoneInfo = {
        top: 4,
        right: 4,
        bottom: 4,
        left: 4,
        adequate: true,
      };
      expect(qz.adequate).toBe(true);
    });

    it("reports inadequate quiet zone", () => {
      const qz: QuietZoneInfo = {
        top: 1,
        right: 2,
        bottom: 0,
        left: 3,
        adequate: false,
      };
      expect(qz.adequate).toBe(false);
    });
  });

  describe("ScanResult", () => {
    it("stores decoded data with location", () => {
      const result: ScanResult = {
        data: "https://example.com",
        location: {
          topLeftCorner: { x: 10, y: 10 },
          topRightCorner: { x: 90, y: 10 },
          bottomLeftCorner: { x: 10, y: 90 },
          bottomRightCorner: { x: 90, y: 90 },
        },
      };
      expect(result.data).toBe("https://example.com");
      expect(result.location).not.toBeNull();
    });

    it("represents failed scan with null data and location", () => {
      const result: ScanResult = { data: null, location: null };
      expect(result.data).toBeNull();
      expect(result.location).toBeNull();
    });

    it("accepts optional binary data", () => {
      const result: ScanResult = {
        data: "binary-content",
        location: null,
        binaryData: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      };
      expect(result.binaryData).toBeInstanceOf(Uint8Array);
      expect(result.binaryData!.length).toBe(5);
    });
  });

  describe("StructuralAnalysis", () => {
    it("reports all structural features present", () => {
      const sa: StructuralAnalysis = {
        hasFinderPatterns: true,
        hasTimingPatterns: true,
        hasAlignmentPatterns: true,
        alignmentPatternCount: 6,
      };
      expect(sa.hasFinderPatterns).toBe(true);
      expect(sa.alignmentPatternCount).toBe(6);
    });

    it("reports version 1 QR with no alignment patterns", () => {
      const sa: StructuralAnalysis = {
        hasFinderPatterns: true,
        hasTimingPatterns: true,
        hasAlignmentPatterns: false,
        alignmentPatternCount: 0,
      };
      expect(sa.hasAlignmentPatterns).toBe(false);
    });
  });

  describe("TimingDiagnostics", () => {
    it("accepts all optional timing fields", () => {
      const timing: TimingDiagnostics = {
        decodeMs: 12.5,
        totalAnalysisMs: 45.3,
        encodeMs: 5.1,
        renderMs: 20.0,
        exportMs: 7.7,
      };
      expect(timing.totalAnalysisMs).toBe(45.3);
    });

    it("accepts null and undefined timing fields", () => {
      const timing: TimingDiagnostics = {
        decodeMs: null,
        totalAnalysisMs: null,
      };
      expect(timing.decodeMs).toBeNull();
      expect(timing.encodeMs).toBeUndefined();
    });
  });

  describe("ValidationResult", () => {
    it("represents a valid scan", () => {
      const vr: ValidationResult = {
        valid: true,
        data: "https://example.com",
        confidence: "high",
      };
      expect(vr.valid).toBe(true);
      expect(vr.confidence).toBe("high");
    });

    it("represents a failed validation", () => {
      const vr: ValidationResult = {
        valid: false,
        error: "No QR code detected",
        confidence: "low",
      };
      expect(vr.valid).toBe(false);
      expect(vr.error).toBe("No QR code detected");
    });

    it("accepts all confidence levels", () => {
      const levels: Array<ValidationResult["confidence"]> = ["high", "medium", "low"];
      expect(new Set(levels).size).toBe(3);
    });
  });

  describe("QRAnalysisResult (composite)", () => {
    it("accepts a minimal failed analysis", () => {
      const result: QRAnalysisResult = {
        success: false,
        error: "No QR code detected",
        errorType: "no_qr_detected",
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        estimatedModulePx: null,
      };
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("no_qr_detected");
    });

    it("accepts a fully populated successful analysis", () => {
      const result: QRAnalysisResult = {
        success: true,
        confidence: "high",
        payload: "https://example.com",
        payloadBytes: new Uint8Array([104, 116, 116, 112]),
        version: 5,
        moduleCount: 37,
        eccLevel: "H",
        maskPattern: 3,
        encodingMode: "byte",
        errorsCorrected: 2,
        erasures: 0,
        orientation: 0,
        numBits: 480,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        warnings: ["Overlay may reduce scannability"],
        contentType: {
          type: "url",
          label: "URL",
          url: "https://example.com",
        },
        detectedColors: {
          foreground: "#000000",
          background: "#ffffff",
          contrastRatio: 21,
        },
        dominantColors: [
          { color: "#000000", percentage: 55, rgb: { r: 0, g: 0, b: 0 } },
          { color: "#ffffff", percentage: 45, rgb: { r: 255, g: 255, b: 255 } },
        ],
        estimatedModulePx: 10,
        quietZone: { top: 4, right: 4, bottom: 4, left: 4, adequate: true },
        dataCapacity: { used: 50, total: 100, percentage: 50, overflow: false },
        structuralAnalysis: {
          hasFinderPatterns: true,
          hasTimingPatterns: true,
          hasAlignmentPatterns: true,
          alignmentPatternCount: 1,
        },
        imageProperties: {
          width: 400,
          height: 400,
          aspectRatio: 1,
          estimatedQrSizePx: 370,
        },
        geometry: {
          corners: {
            topLeft: { x: 15, y: 15 },
            topRight: { x: 385, y: 15 },
            bottomLeft: { x: 15, y: 385 },
            bottomRight: { x: 385, y: 385 },
          },
          boundingBox: {
            minX: 15,
            minY: 15,
            maxX: 385,
            maxY: 385,
            width: 370,
            height: 370,
          },
          topEdgePx: 15,
          leftEdgePx: 15,
          estimatedRotationDeg: 0,
        },
        timing: { decodeMs: 12, totalAnalysisMs: 45, renderMs: 20 },
        moduleMatrix: [
          [true, false, true],
          [false, true, false],
        ],
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
      };
      expect(result.success).toBe(true);
      expect(result.version).toBe(5);
      expect(result.dominantColors).toHaveLength(2);
      expect(result.moduleMatrix![0]).toEqual([true, false, true]);
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
      expect(new Set(modes).size).toBe(6);
    });

    it("accepts all confidence levels", () => {
      const levels: Array<NonNullable<QRAnalysisResult["confidence"]>> = [
        "low",
        "medium",
        "high",
      ];
      expect(new Set(levels).size).toBe(3);
    });
  });

  describe("QRAnalysisResult edge cases", () => {
    it("accepts optional debugLog field", () => {
      const result: QRAnalysisResult = {
        success: true,
        version: 1,
        moduleCount: 21,
        eccLevel: "L",
        maskPattern: 0,
        estimatedModulePx: 5,
        debugLog: "decode: 12ms, analyze: 30ms",
      };
      expect(result.debugLog).toContain("decode");
    });

    it("accepts empty warnings array", () => {
      const result: QRAnalysisResult = {
        success: true,
        version: 1,
        moduleCount: 21,
        eccLevel: "L",
        maskPattern: 0,
        estimatedModulePx: 5,
        warnings: [],
      };
      expect(result.warnings).toHaveLength(0);
    });

    it("accepts multiple warnings", () => {
      const result: QRAnalysisResult = {
        success: false,
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        estimatedModulePx: null,
        warnings: ["Low contrast", "Overlay too large", "Small module size"],
      };
      expect(result.warnings).toHaveLength(3);
    });

    it("accepts empty moduleMatrix", () => {
      const result: QRAnalysisResult = {
        success: true,
        version: 1,
        moduleCount: 0,
        eccLevel: "L",
        maskPattern: 0,
        estimatedModulePx: null,
        moduleMatrix: [],
      };
      expect(result.moduleMatrix).toHaveLength(0);
    });
  });

  describe("ContentTypeDetails for specific types", () => {
    it("accepts wifi content type details", () => {
      const details: ContentTypeDetails = {
        type: "wifi",
        label: "Wi-Fi Network",
        wifiSsid: "MyNetwork",
        wifiAuth: "WPA",
      };
      expect(details.wifiSsid).toBe("MyNetwork");
    });

    it("accepts email content type details", () => {
      const details: ContentTypeDetails = {
        type: "email",
        label: "Email",
        emailAddress: "user@example.com",
      };
      expect(details.emailAddress).toBe("user@example.com");
    });

    it("accepts vcard content type details", () => {
      const details: ContentTypeDetails = {
        type: "vcard",
        label: "Contact",
        contactName: "John Doe",
        phoneNumber: "+1234567890",
        emailAddress: "john@example.com",
      };
      expect(details.contactName).toBe("John Doe");
    });

    it("accepts tel content type details", () => {
      const details: ContentTypeDetails = {
        type: "tel",
        label: "Phone",
        phoneNumber: "+44 20 7946 0958",
      };
      expect(details.phoneNumber).toContain("+44");
    });
  });

  describe("structural field counts (drift detection)", () => {
    it("QRAnalysisResult has 5 required fields", () => {
      const minimal: QRAnalysisResult = {
        success: false,
        version: null,
        moduleCount: 0,
        eccLevel: null,
        maskPattern: null,
        estimatedModulePx: null,
      };
      expect(Object.keys(minimal)).toHaveLength(6);
    });

    it("DecoderMetadata has exactly 12 fields", () => {
      const meta: DecoderMetadata = {
        version: null, maskPattern: null, eccLevel: null,
        errorsCorrected: null, erasures: null, numBits: null,
        orientation: null, structuredAppendSequence: null,
        structuredAppendParity: null, hasStructuredAppend: false,
        byteSegmentCount: 0, totalByteLength: 0,
      };
      expect(Object.keys(meta)).toHaveLength(12);
    });

    it("ContentTypeDetails has 2 required and 14 optional fields", () => {
      const full: ContentTypeDetails = {
        type: "url", label: "URL", url: "x", protocol: "https",
        wifiSsid: "s", wifiAuth: "a", contactName: "n",
        phoneNumber: "p", emailAddress: "e", cryptoCurrency: "BTC",
        cryptoAddress: "addr", amount: "1",
        hasUtmParams: false, utmSource: "s", utmMedium: "m", utmCampaign: "c",
      };
      expect(Object.keys(full)).toHaveLength(16);
    });

    it("GeometryDiagnostics has exactly 5 top-level fields", () => {
      const geo: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 0, y: 0 }, topRight: { x: 1, y: 0 },
          bottomLeft: { x: 0, y: 1 }, bottomRight: { x: 1, y: 1 },
        },
        boundingBox: { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 },
        topEdgePx: 0, leftEdgePx: 0, estimatedRotationDeg: 0,
      };
      expect(Object.keys(geo)).toHaveLength(5);
    });

    it("ImageProperties has exactly 4 fields", () => {
      const props: ImageProperties = {
        width: 100, height: 100, aspectRatio: 1, estimatedQrSizePx: 90,
      };
      expect(Object.keys(props)).toHaveLength(4);
    });

    it("QuietZoneInfo has exactly 5 fields", () => {
      const qz: QuietZoneInfo = { top: 4, right: 4, bottom: 4, left: 4, adequate: true };
      expect(Object.keys(qz)).toHaveLength(5);
    });

    it("StructuralAnalysis has exactly 4 fields", () => {
      const sa: StructuralAnalysis = {
        hasFinderPatterns: true, hasTimingPatterns: true,
        hasAlignmentPatterns: false, alignmentPatternCount: 0,
      };
      expect(Object.keys(sa)).toHaveLength(4);
    });

    it("DataCapacity has exactly 4 fields", () => {
      const dc: DataCapacity = { used: 0, total: 100, percentage: 0, overflow: false };
      expect(Object.keys(dc)).toHaveLength(4);
    });

    it("DetectedColors has exactly 3 fields", () => {
      const dc: DetectedColors = { foreground: "#000", background: "#fff", contrastRatio: 21 };
      expect(Object.keys(dc)).toHaveLength(3);
    });
  });

  describe("index re-exports", () => {
    it("exports only types (no runtime values)", () => {
      expect(Object.keys(indexExports)).toEqual([]);
    });
  });
});
