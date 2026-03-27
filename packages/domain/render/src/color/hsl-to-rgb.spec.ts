import { describe, it, expect } from "vitest";
import { hslToRgb } from "./hsl-to-rgb";

describe("hslToRgb", () => {
  it("converts red hue to RGB", () => {
    const result = hslToRgb(0, 100, 50);
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts green hue to RGB", () => {
    const result = hslToRgb(120, 100, 50);
    expect(result).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("converts blue hue to RGB", () => {
    const result = hslToRgb(240, 100, 50);
    expect(result).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("converts grayscale (saturation 0)", () => {
    const result = hslToRgb(0, 0, 50);
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
    expect(result.r).toBeCloseTo(128, 1);
  });

  it("converts black (lightness 0)", () => {
    const result = hslToRgb(120, 100, 0);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts white (lightness 100)", () => {
    const result = hslToRgb(120, 100, 100);
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts cyan", () => {
    const result = hslToRgb(180, 100, 50);
    expect(result).toEqual({ r: 0, g: 255, b: 255 });
  });

  it("converts magenta", () => {
    const result = hslToRgb(300, 100, 50);
    expect(result).toEqual({ r: 255, g: 0, b: 255 });
  });

  it("converts yellow", () => {
    const result = hslToRgb(60, 100, 50);
    expect(result).toEqual({ r: 255, g: 255, b: 0 });
  });

  it("handles lightness < 0.5", () => {
    const result = hslToRgb(180, 50, 25);
    expect(result.r).toBeLessThan(result.g);
    expect(result.r).toBeLessThan(result.b);
  });

  it("handles lightness > 0.5", () => {
    const result = hslToRgb(180, 50, 75);
    expect(result.r).toBeLessThan(result.g);
    expect(result.r).toBeLessThan(result.b);
  });

  it("returns integers", () => {
    const result = hslToRgb(123.456, 67.89, 45.67);
    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });
});
