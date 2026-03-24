import { describe, expect, it } from "vitest";
import type { ColorMode } from "./color-mode.contract";

describe("ColorMode", () => {
  it("should allow color", () => {
    const mode: ColorMode = "color";
    expect(mode).toBe("color");
  });

  it("should allow grayscale", () => {
    const mode: ColorMode = "grayscale";
    expect(mode).toBe("grayscale");
  });

  it("should allow bw", () => {
    const mode: ColorMode = "bw";
    expect(mode).toBe("bw");
  });
});
