import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { McpToolDescriptor } from "./mcp-tool-descriptor.contract";
import type { QrGenerateInput } from "./qr-generate-input.contract";
import type { QrGeneratePromptArgs } from "./qr-generate-prompt-args.contract";
import type { QrGenerateAdvancedInput } from "./qr-generate-advanced-input.contract";
import {
  qrCapabilitiesResourceSchema,
  qrCapabilitiesResourceUri,
} from "./qr-capabilities-resource.contract";
import { qrGenerateInputSchema } from "./qr-generate-tool.contract";
import { qrGeneratePromptArgsSchema } from "./qr-generate-prompt.contract";
import { qrGenerateAdvancedInputSchema } from "./qr-generate-advanced-tool.contract";
import * as indexExports from "./index";

describe("contracts/mcp", () => {
  // ── Pure TypeScript type contracts ─────────────────────────────

  describe("McpToolDescriptor", () => {
    it("accepts a valid tool descriptor", () => {
      const descriptor: McpToolDescriptor = {
        name: "generate_qr",
        description: "Generate a QR code from input data",
      };
      expect(descriptor.name).toBe("generate_qr");
      expect(descriptor.description).toBe("Generate a QR code from input data");
    });
  });

  describe("QrGenerateInput", () => {
    it("accepts a minimal input with only data", () => {
      const input: QrGenerateInput = { data: "https://example.com" };
      expect(input.data).toBe("https://example.com");
    });

    it("accepts a full input with all optional fields", () => {
      const input: QrGenerateInput = {
        data: "https://example.com",
        size: 400,
        errorCorrection: "H",
        foreground: "000000",
        background: "ffffff",
        format: "svg",
        margin: 4,
      };
      expect(input.format).toBe("svg");
    });

    it("accepts all error correction levels", () => {
      const levels: Array<NonNullable<QrGenerateInput["errorCorrection"]>> = ["L", "M", "Q", "H"];
      expect(new Set(levels).size).toBe(4);
    });

    it("accepts both format options", () => {
      const formats: Array<NonNullable<QrGenerateInput["format"]>> = ["png", "svg"];
      expect(new Set(formats).size).toBe(2);
    });
  });

  describe("QrGeneratePromptArgs", () => {
    it("accepts a minimal prompt args with only intent", () => {
      const args: QrGeneratePromptArgs = { intent: "url" };
      expect(args.intent).toBe("url");
    });

    it("accepts a full prompt args", () => {
      const args: QrGeneratePromptArgs = {
        intent: "wifi",
        data: "WIFI:T:WPA;S:MyNetwork;P:pass123;;",
        format: "png",
      };
      expect(args.intent).toBe("wifi");
    });

    it("accepts all 5 intent types", () => {
      const intents: QrGeneratePromptArgs["intent"][] = [
        "url",
        "wifi",
        "contact",
        "payment",
        "plain_text",
      ];
      expect(new Set(intents).size).toBe(5);
    });
  });

  describe("QrGenerateAdvancedInput", () => {
    it("accepts a minimal input with only data", () => {
      const input: QrGenerateAdvancedInput = { data: "hello" };
      expect(input.data).toBe("hello");
    });

    it("accepts core rendering options", () => {
      const input: QrGenerateAdvancedInput = {
        data: "https://example.com",
        size: 800,
        width: 800,
        height: 800,
        errorCorrection: "Q",
        foreground: "1a1a1a",
        background: "f0f0f0",
        format: "webp",
        margin: 6,
        transparent: true,
        moduleStyle: "rounded",
        finderStyle: "dot",
      };
      expect(input.moduleStyle).toBe("rounded");
    });

    it("accepts overlay options", () => {
      const input: QrGenerateAdvancedInput = {
        data: "test",
        overlayUrl: "https://example.com/logo.png",
        overlayMode: "center",
        overlayIntensity: 80,
        overlayFit: "contain",
        overlayRotate: 45,
        overlayFlipX: true,
      };
      expect(input.overlayMode).toBe("center");
    });

    it("accepts animation options", () => {
      const input: QrGenerateAdvancedInput = {
        data: "test",
        animationPattern: "wave",
        animationPattern2: "shimmer",
        animationFrames: 30,
        animationSpeed: 100,
        animationLoop: true,
        animationBounce: true,
        animationTarget: "both",
        animationWaveAxis: "xy",
        animationEasing: "ease_in_out",
        animationInterpolate: "crossfade",
        animationTemporalDither: "blue_noise",
      };
      expect(input.animationPattern).toBe("wave");
    });

    it("accepts watermark options", () => {
      const input: QrGenerateAdvancedInput = {
        data: "test",
        watermarkEnabled: true,
        watermarkKind: "text",
        watermarkText: "ANQR",
        watermarkPosition: "quiet_zone",
        watermarkOpacity: 0.3,
        watermarkBlend: "multiply",
      };
      expect(input.watermarkKind).toBe("text");
    });

    it("accepts metadata options", () => {
      const input: QrGenerateAdvancedInput = {
        data: "test",
        metaTitle: "My QR",
        metaAuthor: "ANQR",
        metaCopyright: "2026",
        metaDescription: "A QR code",
        metaLicense: "MIT",
        metaCreationTime: true,
        metaCustomKv: '{"key":"value"}',
      };
      expect(input.metaTitle).toBe("My QR");
    });
  });

  // ── Zod schema contracts ──────────────────────────────────────

  describe("qrCapabilitiesResourceSchema", () => {
    const validCapabilities = {
      tools: ["generate_qr", "generate_qr_advanced"],
      formats: ["png", "svg", "webp", "gif"],
      errorCorrectionLevels: ["L", "M", "Q", "H"],
      size: { min: 50, max: 4096, default: 400 },
      margin: { min: 0, max: 20, default: 4 },
      overlay: {
        httpsOnly: true,
        privateNetworkBlocked: true,
        redirectsRevalidated: true,
        maxBytes: 5_000_000,
        timeoutMs: 10_000,
      },
      safety: ["HTTPS-only overlay fetching", "Private network blocking"],
    };

    it("parses a valid capabilities resource", () => {
      const result = qrCapabilitiesResourceSchema.parse(validCapabilities);
      expect(result.tools).toEqual(["generate_qr", "generate_qr_advanced"]);
      expect(result.formats).toEqual(["png", "svg", "webp", "gif"]);
    });

    it("rejects missing required fields", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects invalid tool names", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        tools: ["invalid_tool"],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid format values", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        formats: ["bmp"],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid ECC levels", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        errorCorrectionLevels: ["X"],
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer size values", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        size: { min: 1.5, max: 4096, default: 400 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative margin values", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        margin: { min: -1, max: 20, default: 4 },
      });
      expect(result.success).toBe(false);
    });

    it("enforces overlay.httpsOnly as literal true", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        overlay: { ...validCapabilities.overlay, httpsOnly: false },
      });
      expect(result.success).toBe(false);
    });

    it("enforces overlay.privateNetworkBlocked as literal true", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        overlay: { ...validCapabilities.overlay, privateNetworkBlocked: false },
      });
      expect(result.success).toBe(false);
    });

    it("enforces overlay.redirectsRevalidated as literal true", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        ...validCapabilities,
        overlay: { ...validCapabilities.overlay, redirectsRevalidated: false },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("qrCapabilitiesResourceUri", () => {
    it("has the expected protocol and path", () => {
      expect(qrCapabilitiesResourceUri).toBe("anqr://qr/capabilities");
    });
  });

  describe("qrGenerateInputSchema (object-of-schemas)", () => {
    const schema = z.object(qrGenerateInputSchema);

    it("parses a minimal valid input", () => {
      const result = schema.parse({ data: "hello" });
      expect(result.data).toBe("hello");
    });

    it("parses a full valid input", () => {
      const result = schema.parse({
        data: "https://example.com",
        size: 400,
        errorCorrection: "H",
        foreground: "000000",
        background: "ffffff",
        format: "svg",
        margin: 4,
      });
      expect(result.format).toBe("svg");
    });

    it("rejects empty data", () => {
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects size below minimum (50)", () => {
      const result = schema.safeParse({ data: "test", size: 10 });
      expect(result.success).toBe(false);
    });

    it("rejects size above maximum (4096)", () => {
      const result = schema.safeParse({ data: "test", size: 5000 });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer size", () => {
      const result = schema.safeParse({ data: "test", size: 100.5 });
      expect(result.success).toBe(false);
    });

    it("rejects invalid error correction level", () => {
      const result = schema.safeParse({ data: "test", errorCorrection: "X" });
      expect(result.success).toBe(false);
    });

    it("rejects foreground with # prefix", () => {
      const result = schema.safeParse({ data: "test", foreground: "#000000" });
      expect(result.success).toBe(false);
    });

    it("rejects foreground with invalid hex chars", () => {
      const result = schema.safeParse({ data: "test", foreground: "zzzzzz" });
      expect(result.success).toBe(false);
    });

    it("rejects margin below 0", () => {
      const result = schema.safeParse({ data: "test", margin: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects margin above 20", () => {
      const result = schema.safeParse({ data: "test", margin: 25 });
      expect(result.success).toBe(false);
    });

    it("rejects invalid format", () => {
      const result = schema.safeParse({ data: "test", format: "bmp" });
      expect(result.success).toBe(false);
    });

    it("accepts boundary values", () => {
      const result = schema.parse({
        data: "x",
        size: 50,
        margin: 0,
        foreground: "aAbBcC",
        background: "000000",
      });
      expect(result.size).toBe(50);
      expect(result.margin).toBe(0);
    });
  });

  describe("qrGeneratePromptArgsSchema (object-of-schemas)", () => {
    const schema = z.object(qrGeneratePromptArgsSchema);

    it("parses a minimal valid input", () => {
      const result = schema.parse({ intent: "url" });
      expect(result.intent).toBe("url");
    });

    it("parses a full valid input", () => {
      const result = schema.parse({
        intent: "wifi",
        data: "WIFI:T:WPA;S:Net;P:pass;;",
        format: "png",
      });
      expect(result.intent).toBe("wifi");
    });

    it("rejects missing intent", () => {
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects invalid intent", () => {
      const result = schema.safeParse({ intent: "invalid" });
      expect(result.success).toBe(false);
    });

    it("accepts all 5 intent values", () => {
      const intents = ["url", "wifi", "contact", "payment", "plain_text"] as const;
      for (const intent of intents) {
        expect(schema.parse({ intent }).intent).toBe(intent);
      }
    });

    it("rejects invalid format", () => {
      const result = schema.safeParse({ intent: "url", format: "gif" });
      expect(result.success).toBe(false);
    });
  });

  describe("qrGenerateAdvancedInputSchema (object-of-schemas)", () => {
    const schema = z.object(qrGenerateAdvancedInputSchema);

    it("parses a minimal valid input", () => {
      const result = schema.parse({ data: "hello" });
      expect(result.data).toBe("hello");
    });

    it("rejects empty data string", () => {
      const result = schema.safeParse({ data: "" });
      expect(result.success).toBe(false);
    });

    it("rejects data exceeding 4096 characters", () => {
      const result = schema.safeParse({ data: "x".repeat(4097) });
      expect(result.success).toBe(false);
    });

    it("accepts data at exactly 4096 characters", () => {
      const result = schema.parse({ data: "x".repeat(4096) });
      expect(result.data.length).toBe(4096);
    });

    it("validates size boundaries", () => {
      expect(schema.safeParse({ data: "x", size: 49 }).success).toBe(false);
      expect(schema.safeParse({ data: "x", size: 4097 }).success).toBe(false);
      expect(schema.parse({ data: "x", size: 50 }).size).toBe(50);
      expect(schema.parse({ data: "x", size: 4096 }).size).toBe(4096);
    });

    it("validates error correction enum", () => {
      for (const ec of ["L", "M", "Q", "H"] as const) {
        expect(schema.parse({ data: "x", errorCorrection: ec }).errorCorrection).toBe(ec);
      }
      expect(schema.safeParse({ data: "x", errorCorrection: "X" }).success).toBe(false);
    });

    it("validates hex color regex (no # prefix)", () => {
      expect(schema.parse({ data: "x", foreground: "aaBBcc" }).foreground).toBe("aaBBcc");
      expect(schema.safeParse({ data: "x", foreground: "#000000" }).success).toBe(false);
      expect(schema.safeParse({ data: "x", background: "xyz" }).success).toBe(false);
    });

    it("validates format enum", () => {
      for (const fmt of ["png", "svg", "webp", "gif"] as const) {
        expect(schema.parse({ data: "x", format: fmt }).format).toBe(fmt);
      }
      expect(schema.safeParse({ data: "x", format: "bmp" }).success).toBe(false);
    });

    it("validates margin range 0–20", () => {
      expect(schema.parse({ data: "x", margin: 0 }).margin).toBe(0);
      expect(schema.parse({ data: "x", margin: 20 }).margin).toBe(20);
      expect(schema.safeParse({ data: "x", margin: -1 }).success).toBe(false);
      expect(schema.safeParse({ data: "x", margin: 21 }).success).toBe(false);
    });

    it("validates version range 0–40", () => {
      expect(schema.parse({ data: "x", version: 0 }).version).toBe(0);
      expect(schema.parse({ data: "x", version: 40 }).version).toBe(40);
      expect(schema.safeParse({ data: "x", version: 41 }).success).toBe(false);
    });

    it("validates maskPattern as union of auto and 0–7", () => {
      expect(schema.parse({ data: "x", maskPattern: "auto" }).maskPattern).toBe("auto");
      expect(schema.parse({ data: "x", maskPattern: 0 }).maskPattern).toBe(0);
      expect(schema.parse({ data: "x", maskPattern: 7 }).maskPattern).toBe(7);
      expect(schema.safeParse({ data: "x", maskPattern: 8 }).success).toBe(false);
      expect(schema.safeParse({ data: "x", maskPattern: "manual" }).success).toBe(false);
    });

    it("validates overlayUrl requires https", () => {
      expect(
        schema.parse({ data: "x", overlayUrl: "https://example.com/logo.png" }).overlayUrl,
      ).toBe("https://example.com/logo.png");
      expect(
        schema.safeParse({ data: "x", overlayUrl: "http://example.com/logo.png" }).success,
      ).toBe(false);
    });

    it("validates overlayMode enum", () => {
      for (const mode of ["dithered", "fill", "fit", "center", "subpixel"] as const) {
        expect(schema.parse({ data: "x", overlayMode: mode }).overlayMode).toBe(mode);
      }
    });

    it("validates overlayIntensity range 0–100", () => {
      expect(schema.parse({ data: "x", overlayIntensity: 0 }).overlayIntensity).toBe(0);
      expect(schema.parse({ data: "x", overlayIntensity: 100 }).overlayIntensity).toBe(100);
      expect(schema.safeParse({ data: "x", overlayIntensity: 101 }).success).toBe(false);
    });

    it("validates moduleStyle enum", () => {
      for (const style of ["square", "dot", "rounded"] as const) {
        expect(schema.parse({ data: "x", moduleStyle: style }).moduleStyle).toBe(style);
      }
    });

    it("validates gradientStops array with max 8 stops", () => {
      const twoStops = [
        { pos: 0, color: "ff0000" },
        { pos: 1, color: "0000ff" },
      ];
      expect(schema.parse({ data: "x", gradientStops: twoStops }).gradientStops).toHaveLength(2);

      const nineStops = Array.from({ length: 9 }, (_, i) => ({
        pos: i / 8,
        color: "112233",
      }));
      expect(schema.safeParse({ data: "x", gradientStops: nineStops }).success).toBe(false);
    });

    it("validates animation fields", () => {
      const result = schema.parse({
        data: "x",
        animationPattern: "wave",
        animationFrames: 30,
        animationSpeed: 100,
        animationEasing: "bounce",
        animationTarget: "both",
        animationWaveAxis: "xy",
        animationInterpolate: "morph",
        animationTemporalDither: "flicker_safe",
      });
      expect(result.animationPattern).toBe("wave");
      expect(result.animationEasing).toBe("bounce");
    });

    it("validates watermark fields", () => {
      const result = schema.parse({
        data: "x",
        watermarkEnabled: true,
        watermarkKind: "pattern",
        watermarkPosition: "behind",
        watermarkOpacity: 0.5,
        watermarkBlend: "soft-light",
      });
      expect(result.watermarkKind).toBe("pattern");
    });

    it("validates characterEncoding enum", () => {
      for (const enc of ["default", "utf8", "shift-jis"] as const) {
        expect(schema.parse({ data: "x", characterEncoding: enc }).characterEncoding).toBe(enc);
      }
    });

    it("validates overlayEdgeDetect enum", () => {
      for (const mode of ["off", "sobel", "canny"] as const) {
        expect(schema.parse({ data: "x", overlayEdgeDetect: mode }).overlayEdgeDetect).toBe(mode);
      }
    });

    it("validates watermarkImageUrl requires https", () => {
      expect(
        schema.safeParse({ data: "x", watermarkImageUrl: "http://example.com/wm.png" }).success,
      ).toBe(false);
      expect(
        schema.parse({ data: "x", watermarkImageUrl: "https://example.com/wm.png" })
          .watermarkImageUrl,
      ).toBe("https://example.com/wm.png");
    });

    it("validates minContrastRatio range 1–21", () => {
      expect(schema.parse({ data: "x", minContrastRatio: 1 }).minContrastRatio).toBe(1);
      expect(schema.parse({ data: "x", minContrastRatio: 21 }).minContrastRatio).toBe(21);
      expect(schema.safeParse({ data: "x", minContrastRatio: 0.5 }).success).toBe(false);
      expect(schema.safeParse({ data: "x", minContrastRatio: 22 }).success).toBe(false);
    });

    it("validates eccAwareRiskBudget range 0–1", () => {
      expect(schema.parse({ data: "x", eccAwareRiskBudget: 0 }).eccAwareRiskBudget).toBe(0);
      expect(schema.parse({ data: "x", eccAwareRiskBudget: 1 }).eccAwareRiskBudget).toBe(1);
      expect(schema.safeParse({ data: "x", eccAwareRiskBudget: 1.1 }).success).toBe(false);
    });

    it("validates palette array with max 16 entries", () => {
      const validPalette = ["ff0000", "00ff00", "0000ff"];
      expect(schema.parse({ data: "x", palette: validPalette }).palette).toHaveLength(3);

      const oversize = Array.from({ length: 17 }, () => "112233");
      expect(schema.safeParse({ data: "x", palette: oversize }).success).toBe(false);
    });
  });

  // ── Cross-schema consistency ───────────────────────────────────

  describe("cross-schema consistency", () => {
    const basicSchema = z.object(qrGenerateInputSchema);
    const advancedSchema = z.object(qrGenerateAdvancedInputSchema);

    // Note: advanced schema additionally enforces min(1) on data
    it("basic and advanced schemas share the same data constraints", () => {
      expect(basicSchema.safeParse({}).success).toBe(false);
      expect(advancedSchema.safeParse({}).success).toBe(false);

      expect(basicSchema.parse({ data: "x" }).data).toBe("x");
      expect(advancedSchema.parse({ data: "x" }).data).toBe("x");
    });

    it("basic and advanced schemas share the same size range (50-4096)", () => {
      expect(basicSchema.safeParse({ data: "x", size: 49 }).success).toBe(false);
      expect(advancedSchema.safeParse({ data: "x", size: 49 }).success).toBe(false);

      expect(basicSchema.safeParse({ data: "x", size: 4097 }).success).toBe(false);
      expect(advancedSchema.safeParse({ data: "x", size: 4097 }).success).toBe(false);

      expect(basicSchema.parse({ data: "x", size: 50 }).size).toBe(50);
      expect(advancedSchema.parse({ data: "x", size: 50 }).size).toBe(50);
    });

    it("basic and advanced schemas share the same EC levels", () => {
      for (const ec of ["L", "M", "Q", "H"] as const) {
        expect(basicSchema.parse({ data: "x", errorCorrection: ec }).errorCorrection).toBe(ec);
        expect(advancedSchema.parse({ data: "x", errorCorrection: ec }).errorCorrection).toBe(ec);
      }
      expect(basicSchema.safeParse({ data: "x", errorCorrection: "X" }).success).toBe(false);
      expect(advancedSchema.safeParse({ data: "x", errorCorrection: "X" }).success).toBe(false);
    });

    it("basic and advanced schemas share the same hex color regex", () => {
      expect(basicSchema.parse({ data: "x", foreground: "aaBBcc" }).foreground).toBe("aaBBcc");
      expect(advancedSchema.parse({ data: "x", foreground: "aaBBcc" }).foreground).toBe("aaBBcc");

      expect(basicSchema.safeParse({ data: "x", foreground: "#000000" }).success).toBe(false);
      expect(advancedSchema.safeParse({ data: "x", foreground: "#000000" }).success).toBe(false);
    });

    it("basic and advanced schemas share the same margin range (0-20)", () => {
      expect(basicSchema.parse({ data: "x", margin: 0 }).margin).toBe(0);
      expect(advancedSchema.parse({ data: "x", margin: 0 }).margin).toBe(0);

      expect(basicSchema.safeParse({ data: "x", margin: 21 }).success).toBe(false);
      expect(advancedSchema.safeParse({ data: "x", margin: 21 }).success).toBe(false);
    });

    it("advanced schema has all fields that basic schema has", () => {
      const basicKeys = Object.keys(qrGenerateInputSchema).sort();
      const advancedKeys = Object.keys(qrGenerateAdvancedInputSchema).sort();
      for (const key of basicKeys) {
        expect(advancedKeys).toContain(key);
      }
    });

    it("advanced schema has format options that are a superset of basic", () => {
      expect(basicSchema.parse({ data: "x", format: "png" }).format).toBe("png");
      expect(basicSchema.parse({ data: "x", format: "svg" }).format).toBe("svg");

      expect(advancedSchema.parse({ data: "x", format: "png" }).format).toBe("png");
      expect(advancedSchema.parse({ data: "x", format: "svg" }).format).toBe("svg");
      expect(advancedSchema.parse({ data: "x", format: "webp" }).format).toBe("webp");
      expect(advancedSchema.parse({ data: "x", format: "gif" }).format).toBe("gif");
    });
  });

  describe("schema key counts", () => {
    it("basic input schema has exactly 7 fields", () => {
      expect(Object.keys(qrGenerateInputSchema)).toHaveLength(7);
    });

    it("prompt args schema has exactly 3 fields", () => {
      expect(Object.keys(qrGeneratePromptArgsSchema)).toHaveLength(3);
    });

    it("capabilities resource schema validates non-empty arrays", () => {
      const result = qrCapabilitiesResourceSchema.safeParse({
        tools: [],
        formats: [],
        errorCorrectionLevels: [],
        size: { min: 50, max: 4096, default: 400 },
        margin: { min: 0, max: 20, default: 4 },
        overlay: {
          httpsOnly: true,
          privateNetworkBlocked: true,
          redirectsRevalidated: true,
          maxBytes: 5_000_000,
          timeoutMs: 10_000,
        },
        safety: [],
      });
      expect(result.success).toBe(true);
    });
  });

  // ── Index re-exports ──────────────────────────────────────────

  describe("index re-exports", () => {
    it("exports runtime schemas and URI", () => {
      const keys = Object.keys(indexExports);
      expect(keys).toContain("qrCapabilitiesResourceSchema");
      expect(keys).toContain("qrCapabilitiesResourceUri");
      expect(keys).toContain("qrGenerateInputSchema");
      expect(keys).toContain("qrGenerateAdvancedInputSchema");
      expect(keys).toContain("qrGeneratePromptArgsSchema");
    });

    it("does not export type-only members as runtime values", () => {
      const keys = Object.keys(indexExports);
      expect(keys).not.toContain("McpToolDescriptor");
      expect(keys).not.toContain("QrGenerateInput");
      expect(keys).not.toContain("QrGenerateAdvancedInput");
      expect(keys).not.toContain("QrCapabilitiesResource");
      expect(keys).not.toContain("QrGeneratePromptArgs");
    });
  });
});
