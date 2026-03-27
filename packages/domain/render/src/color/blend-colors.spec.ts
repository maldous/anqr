import { describe, it, expect } from "vitest";
import { blendColors } from "./blend-colors";

describe("blendColors", () => {
  it("blends two colors with ratio 0 (returns first color)", () => {
    const result = blendColors("#ff0000", "#0000ff", 0);
    expect(result).toBe("#ff0000");
  });

  it("blends two colors with ratio 1 (returns second color)", () => {
    const result = blendColors("#ff0000", "#0000ff", 1);
    expect(result).toBe("#0000ff");
  });

  it("blends two colors with ratio 0.5 (halfway)", () => {
    const result = blendColors("#ff0000", "#0000ff", 0.5);
    expect(result).toBe("#800080"); // purple
  });

  it("handles rgb color strings", () => {
    const result = blendColors("rgb(255,0,0)", "rgb(0,0,255)", 0.5);
    expect(result).toBe("#800080");
  });

  it("handles rgba colors with alpha", () => {
    const result = blendColors("rgba(255,0,0,0.5)", "rgba(0,0,255,0.5)", 0.5);
    expect(result).toContain("rgba");
  });

  it("blends black and white", () => {
    const result = blendColors("#000000", "#ffffff", 0.5);
    expect(result).toBe("#808080");
  });

  it("handles invalid color by using black as fallback", () => {
    const result = blendColors("invalid", "#ffffff", 0.5);
    expect(result).toBe("#808080");
  });

  it("returns hex for fully opaque colors", () => {
    const result = blendColors("#ff0000", "#00ff00", 0.3);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns rgba for transparent colors", () => {
    const result = blendColors("rgba(255,0,0,0.8)", "rgba(0,255,0,0.6)", 0.5);
    expect(result).toMatch(/^rgba\(/);
  });

  it("handles ratio outside 0-1 range", () => {
    const result1 = blendColors("#ff0000", "#0000ff", -0.5);
    const result2 = blendColors("#ff0000", "#0000ff", 1.5);
    expect(typeof result1).toBe("string");
    expect(typeof result2).toBe("string");
  });
});
