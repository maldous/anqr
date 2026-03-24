import { describe, expect, it } from "vitest";
import { qrGenerateAdvancedInputSchema } from "./qr-generate-advanced-tool.contract";

describe("qrGenerateAdvancedInputSchema", () => {
  it("should validate minimal valid input", () => {
    expect(() => qrGenerateAdvancedInputSchema.data.parse("Hello World")).not.toThrow();
  });

  it("should reject empty data", () => {
    expect(() => qrGenerateAdvancedInputSchema.data.parse("")).toThrow();
  });

  it("should reject data exceeding max length", () => {
    const longData = "a".repeat(4097);
    expect(() => qrGenerateAdvancedInputSchema.data.parse(longData)).toThrow();
  });

  it("should validate size constraints", () => {
    expect(() => qrGenerateAdvancedInputSchema.size.parse(256)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.size.parse(49)).toThrow();
    expect(() => qrGenerateAdvancedInputSchema.size.parse(4097)).toThrow();
  });

  it("should validate error correction levels", () => {
    expect(() => qrGenerateAdvancedInputSchema.errorCorrection.parse("L")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.errorCorrection.parse("M")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.errorCorrection.parse("Q")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.errorCorrection.parse("H")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.errorCorrection.parse("X")).toThrow();
  });

  it("should validate hex color format", () => {
    expect(() => qrGenerateAdvancedInputSchema.foreground.parse("000000")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.foreground.parse("FFFFFF")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.foreground.parse("abc123")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.foreground.parse("#000000")).toThrow();
    expect(() => qrGenerateAdvancedInputSchema.foreground.parse("00000")).toThrow();
  });

  it("should validate output formats", () => {
    expect(() => qrGenerateAdvancedInputSchema.format.parse("png")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.format.parse("svg")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.format.parse("webp")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.format.parse("gif")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.format.parse("jpg")).toThrow();
  });

  it("should validate overlay URL requires HTTPS", () => {
    expect(() =>
      qrGenerateAdvancedInputSchema.overlayUrl.parse("https://example.com/image.png"),
    ).not.toThrow();
    expect(() =>
      qrGenerateAdvancedInputSchema.overlayUrl.parse("http://example.com/image.png"),
    ).toThrow();
  });

  it("should validate gradient stops", () => {
    const validStops = [
      { pos: 0, color: "000000" },
      { pos: 1, color: "FFFFFF" },
    ];
    expect(() => qrGenerateAdvancedInputSchema.gradientStops.parse(validStops)).not.toThrow();

    const tooManyStops = Array.from({ length: 9 }, (_, i) => ({ pos: i / 8, color: "000000" }));
    expect(() => qrGenerateAdvancedInputSchema.gradientStops.parse(tooManyStops)).toThrow();
  });

  it("should validate animation patterns", () => {
    expect(() => qrGenerateAdvancedInputSchema.animationPattern.parse("pulse")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.animationPattern.parse("wave")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.animationPattern.parse("invalid")).toThrow();
  });

  it("should validate QR version range", () => {
    expect(() => qrGenerateAdvancedInputSchema.version.parse(0)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.version.parse(20)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.version.parse(40)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.version.parse(41)).toThrow();
  });

  it("should validate mask pattern", () => {
    expect(() => qrGenerateAdvancedInputSchema.maskPattern.parse("auto")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.maskPattern.parse(0)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.maskPattern.parse(7)).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.maskPattern.parse(8)).toThrow();
  });

  it("should validate watermark options", () => {
    expect(() => qrGenerateAdvancedInputSchema.watermarkKind.parse("text")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.watermarkKind.parse("image")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.watermarkKind.parse("pattern")).not.toThrow();
    expect(() => qrGenerateAdvancedInputSchema.watermarkBlend.parse("multiply")).not.toThrow();
  });
});
