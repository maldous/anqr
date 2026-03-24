import { describe, expect, it } from "vitest";
import type { AnimationInterpolation } from "./animation-interpolation.contract";

describe("AnimationInterpolation", () => {
  it("should allow none", () => {
    const interpolation: AnimationInterpolation = "none";
    expect(interpolation).toBe("none");
  });

  it("should allow crossfade", () => {
    const interpolation: AnimationInterpolation = "crossfade";
    expect(interpolation).toBe("crossfade");
  });

  it("should allow morph", () => {
    const interpolation: AnimationInterpolation = "morph";
    expect(interpolation).toBe("morph");
  });
});
