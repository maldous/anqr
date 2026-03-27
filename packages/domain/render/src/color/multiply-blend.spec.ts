import { describe, it, expect } from "vitest";
import { multiplyBlend } from "./multiply-blend";

describe("multiplyBlend", () => {
  it("multiplies white with white to get white", () => {
    const result = multiplyBlend({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 });
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("multiplies any color with black to get black", () => {
    const result = multiplyBlend({ r: 255, g: 128, b: 64 }, { r: 0, g: 0, b: 0 });
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("multiplies red with blue to get black", () => {
    const result = multiplyBlend({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 });
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("multiplies gray with gray", () => {
    const result = multiplyBlend({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
    expect(result.r).toBe(64);
    expect(result.g).toBe(64);
    expect(result.b).toBe(64);
  });

  it("returns rounded integer values", () => {
    const result = multiplyBlend({ r: 100, g: 150, b: 200 }, { r: 50, g: 75, b: 100 });
    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });

  it("darkens colors", () => {
    const top = { r: 200, g: 150, b: 100 };
    const bottom = { r: 200, g: 150, b: 100 };
    const result = multiplyBlend(top, bottom);
    expect(result.r).toBeLessThanOrEqual(top.r);
    expect(result.g).toBeLessThanOrEqual(top.g);
    expect(result.b).toBeLessThanOrEqual(top.b);
  });

  it("preserves values in 0-255 range", () => {
    const result = multiplyBlend({ r: 255, g: 255, b: 255 }, { r: 128, g: 200, b: 64 });
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(0);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(0);
    expect(result.b).toBeLessThanOrEqual(255);
  });
});
