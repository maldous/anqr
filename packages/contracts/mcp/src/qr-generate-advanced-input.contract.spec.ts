import { describe, expect, it } from "vitest";
import type { QrGenerateAdvancedInput } from "./qr-generate-advanced-input.contract";

describe("QrGenerateAdvancedInput", () => {
  it("should allow minimal input with only data", () => {
    const input: QrGenerateAdvancedInput = {
      data: "https://example.com",
    };

    expect(input.data).toBe("https://example.com");
  });

  it("should allow comprehensive configuration", () => {
    const input: QrGenerateAdvancedInput = {
      data: "Advanced QR",
      size: 800,
      width: 800,
      height: 800,
      errorCorrection: "H",
      foreground: "000000",
      background: "ffffff",
      format: "png",
      margin: 4,
      transparent: false,
      moduleStyle: "rounded",
      finderStyle: "rounded",
      overlayUrl: "https://example.com/logo.png",
      overlayMode: "dithered",
      watermarkEnabled: true,
      watermarkText: "ANQR",
      animationPattern: "wave",
      animationFrames: 30,
      metaTitle: "Advanced QR Code",
    };

    expect(input.data).toBe("Advanced QR");
    expect(input.size).toBe(800);
    expect(input.moduleStyle).toBe("rounded");
    expect(input.watermarkEnabled).toBe(true);
    expect(input.animationPattern).toBe("wave");
  });

  it("should allow animation configuration", () => {
    const input: QrGenerateAdvancedInput = {
      data: "test",
      animationPattern: "pulse",
      animationPattern2: "shimmer",
      animationTarget: "modules",
      animationWaveAxis: "xy",
      animationFrames: 60,
      animationSpeed: 1.5,
      animationLoop: true,
      animationBounce: false,
    };

    expect(input.animationPattern).toBe("pulse");
    expect(input.animationPattern2).toBe("shimmer");
    expect(input.animationTarget).toBe("modules");
  });

  it("should allow overlay and watermark settings", () => {
    const input: QrGenerateAdvancedInput = {
      data: "test",
      overlayUrl: "https://example.com/overlay.png",
      overlayIntensity: 50,
      overlayBrightness: 1.2,
      overlayContrast: 1.1,
      watermarkKind: "text",
      watermarkPosition: "corners",
      watermarkOpacity: 0.5,
      watermarkBlend: "multiply",
    };

    expect(input.overlayIntensity).toBe(50);
    expect(input.watermarkKind).toBe("text");
    expect(input.watermarkBlend).toBe("multiply");
  });
});
