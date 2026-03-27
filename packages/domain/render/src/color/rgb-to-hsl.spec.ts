import { describe, it, expect } from "vitest";
import { rgbToHsl } from "./rgb-to-hsl";

describe("rgbToHsl", () => {
  it("should convert pure red to HSL", () => {
    const result = rgbToHsl(255, 0, 0);
    expect(result.h).toBeCloseTo(0, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should convert pure green to HSL", () => {
    const result = rgbToHsl(0, 255, 0);
    expect(result.h).toBeCloseTo(120, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should convert pure blue to HSL", () => {
    const result = rgbToHsl(0, 0, 255);
    expect(result.h).toBeCloseTo(240, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should convert white to HSL", () => {
    const result = rgbToHsl(255, 255, 255);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(100, 0);
  });

  it("should convert black to HSL", () => {
    const result = rgbToHsl(0, 0, 0);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(0);
  });

  it("should convert gray to HSL", () => {
    const result = rgbToHsl(128, 128, 128);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(50.2, 0);
  });

  it("should convert cyan to HSL", () => {
    const result = rgbToHsl(0, 255, 255);
    expect(result.h).toBeCloseTo(180, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should convert magenta to HSL", () => {
    const result = rgbToHsl(255, 0, 255);
    expect(result.h).toBeCloseTo(300, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should convert yellow to HSL", () => {
    const result = rgbToHsl(255, 255, 0);
    expect(result.h).toBeCloseTo(60, 0);
    expect(result.s).toBeCloseTo(100, 0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it("should handle arbitrary RGB values", () => {
    const result = rgbToHsl(100, 150, 200);
    expect(result.h).toBeGreaterThan(0);
    expect(result.h).toBeLessThan(360);
    expect(result.s).toBeGreaterThanOrEqual(0);
    expect(result.s).toBeLessThanOrEqual(100);
    expect(result.l).toBeGreaterThanOrEqual(0);
    expect(result.l).toBeLessThanOrEqual(100);
  });
});
