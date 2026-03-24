import { describe, expect, it } from "vitest";
import type { GifQuantizer } from "./gif-quantizer.contract";

describe("GifQuantizer", () => {
  it("should allow median_cut", () => {
    const quantizer: GifQuantizer = "median_cut";
    expect(quantizer).toBe("median_cut");
  });

  it("should allow neuquant", () => {
    const quantizer: GifQuantizer = "neuquant";
    expect(quantizer).toBe("neuquant");
  });

  it("should allow octree", () => {
    const quantizer: GifQuantizer = "octree";
    expect(quantizer).toBe("octree");
  });
});
