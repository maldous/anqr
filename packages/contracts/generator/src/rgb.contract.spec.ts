import { describe, expect, it } from "vitest";
import type { RGB } from "./rgb.contract";

describe("RGB", () => {
  it("should allow valid RGB color", () => {
    const color: RGB = {
      r: 255,
      g: 128,
      b: 0,
    };

    expect(color.r).toBe(255);
    expect(color.g).toBe(128);
    expect(color.b).toBe(0);
  });

  it("should allow black", () => {
    const color: RGB = {
      r: 0,
      g: 0,
      b: 0,
    };

    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
  });

  it("should allow white", () => {
    const color: RGB = {
      r: 255,
      g: 255,
      b: 255,
    };

    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
  });
});
