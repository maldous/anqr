import { describe, expect, it } from "vitest";
import type { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.contract";

describe("AnimationTemporalDitherMode", () => {
  it("should allow off", () => {
    const mode: AnimationTemporalDitherMode = "off";
    expect(mode).toBe("off");
  });

  it("should allow blue_noise", () => {
    const mode: AnimationTemporalDitherMode = "blue_noise";
    expect(mode).toBe("blue_noise");
  });

  it("should allow flicker_safe", () => {
    const mode: AnimationTemporalDitherMode = "flicker_safe";
    expect(mode).toBe("flicker_safe");
  });
});
