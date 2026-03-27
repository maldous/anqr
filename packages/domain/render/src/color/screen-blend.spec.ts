import { describe, it, expect } from "vitest";
import { screenBlend } from "./screen-blend";

describe("screenBlend", () => {
  it("blends white with white to get white", () => {
    const result = screenBlend({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 });
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("blends black with black to get black", () => {
    const result = screenBlend({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 });
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("blends any color with white to get white", () => {
    const result = screenBlend({ r: 128, g: 64, b: 192 }, { r: 255, g: 255, b: 255 });
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("lightens colors", () => {
    const top = { r: 100, g: 100, b: 100 };
    const bottom = { r: 100, g: 100, b: 100 };
    const result = screenBlend(top, bottom);
    expect(result.r).toBeGreaterThanOrEqual(top.r);
    expect(result.g).toBeGreaterThanOrEqual(top.g);
    expect(result.b).toBeGreaterThanOrEqual(top.b);
  });

  it("returns rounded integer values", () => {
    const result = screenBlend({ r: 100, g: 150, b: 200 }, { r: 50, g: 75, b: 100 });
    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });

  it("preserves values in 0-255 range", () => {
    const result = screenBlend({ r: 200, g: 150, b: 100 }, { r: 100, g: 180, b: 220 });
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(0);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(0);
    expect(result.b).toBeLessThanOrEqual(255);
  });
});
