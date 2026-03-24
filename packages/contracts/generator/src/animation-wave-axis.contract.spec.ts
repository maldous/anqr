import { describe, expect, it } from "vitest";
import type { AnimationWaveAxis } from "./animation-wave-axis.contract";

describe("AnimationWaveAxis", () => {
  it("should allow x", () => {
    const axis: AnimationWaveAxis = "x";
    expect(axis).toBe("x");
  });

  it("should allow y", () => {
    const axis: AnimationWaveAxis = "y";
    expect(axis).toBe("y");
  });

  it("should allow xy", () => {
    const axis: AnimationWaveAxis = "xy";
    expect(axis).toBe("xy");
  });
});
