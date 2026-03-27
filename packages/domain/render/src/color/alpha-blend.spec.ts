import { describe, it, expect } from "vitest";
import { alphaBlend } from "./alpha-blend";

describe("alphaBlend", () => {
  it("blends fully opaque colors", () => {
    const top = { r: 255, g: 0, b: 0, a: 1 };
    const bottom = { r: 0, g: 0, b: 255, a: 1 };
    const result = alphaBlend(top, bottom);
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("blends semi-transparent top over opaque bottom", () => {
    const top = { r: 255, g: 0, b: 0, a: 0.5 };
    const bottom = { r: 0, g: 0, b: 255, a: 1 };
    const result = alphaBlend(top, bottom);
    expect(result.a).toBeCloseTo(1, 2);
    expect(result.r).toBeGreaterThan(0);
    expect(result.b).toBeGreaterThan(0);
  });

  it("blends two semi-transparent colors", () => {
    const top = { r: 255, g: 0, b: 0, a: 0.5 };
    const bottom = { r: 0, g: 255, b: 0, a: 0.5 };
    const result = alphaBlend(top, bottom);
    expect(result.a).toBeCloseTo(0.75, 2);
    expect(result.r).toBeGreaterThan(0);
    expect(result.g).toBeGreaterThan(0);
  });

  it("returns transparent black when both inputs are transparent", () => {
    const top = { r: 255, g: 100, b: 50, a: 0 };
    const bottom = { r: 100, g: 200, b: 150, a: 0 };
    const result = alphaBlend(top, bottom);
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("handles fully transparent top", () => {
    const top = { r: 255, g: 0, b: 0, a: 0 };
    const bottom = { r: 0, g: 0, b: 255, a: 1 };
    const result = alphaBlend(top, bottom);
    expect(result).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it("handles fully transparent bottom", () => {
    const top = { r: 255, g: 0, b: 0, a: 1 };
    const bottom = { r: 0, g: 0, b: 255, a: 0 };
    const result = alphaBlend(top, bottom);
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("returns rounded RGB values", () => {
    const top = { r: 100, g: 150, b: 200, a: 0.3 };
    const bottom = { r: 50, g: 75, b: 100, a: 0.7 };
    const result = alphaBlend(top, bottom);
    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });

  it("preserves color values in valid RGB range", () => {
    const top = { r: 255, g: 255, b: 255, a: 0.8 };
    const bottom = { r: 0, g: 0, b: 0, a: 0.8 };
    const result = alphaBlend(top, bottom);
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(0);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(0);
    expect(result.b).toBeLessThanOrEqual(255);
  });
});
