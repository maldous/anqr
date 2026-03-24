import { describe, expect, it } from "vitest";
import type { GifDither } from "./gif-dither.contract";

describe("GifDither", () => {
  it("should allow off", () => {
    const dither: GifDither = "off";
    expect(dither).toBe("off");
  });

  it("should allow floyd", () => {
    const dither: GifDither = "floyd";
    expect(dither).toBe("floyd");
  });

  it("should allow ordered", () => {
    const dither: GifDither = "ordered";
    expect(dither).toBe("ordered");
  });
});
