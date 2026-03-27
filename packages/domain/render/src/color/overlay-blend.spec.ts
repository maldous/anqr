import { describe, it, expect } from "vitest";
import { overlayBlend } from "./overlay-blend";

describe("overlayBlend", () => {
  it("handles black top color", () => {
    const result = overlayBlend({ r: 0, g: 0, b: 0 }, { r: 128, g: 128, b: 128 });
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("handles bottom < 128 (multiply mode)", () => {
    const result = overlayBlend({ r: 100, g: 100, b: 100 }, { r: 50, g: 50, b: 50 });
    expect(result.r).toBeLessThan(100);
    expect(result.g).toBeLessThan(100);
    expect(result.b).toBeLessThan(100);
  });

  it("handles bottom >= 128 (screen mode)", () => {
    const result = overlayBlend({ r: 100, g: 100, b: 100 }, { r: 200, g: 200, b: 200 });
    expect(result.r).toBeGreaterThan(100);
    expect(result.g).toBeGreaterThan(100);
    expect(result.b).toBeGreaterThan(100);
  });

  it("returns integers", () => {
    const result = overlayBlend({ r: 123, g: 234, b: 45 }, { r: 67, g: 189, b: 201 });
    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });

  it("preserves values in 0-255 range", () => {
    const result = overlayBlend({ r: 255, g: 200, b: 100 }, { r: 50, g: 150, b: 250 });
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(0);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(0);
    expect(result.b).toBeLessThanOrEqual(255);
  });
});
