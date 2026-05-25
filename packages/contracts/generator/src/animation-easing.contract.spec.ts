import { describe, it, expect } from "vitest";
import type { AnimationEasing } from "./animation-easing.contract";

describe("contracts/generator/animation-easing", () => {
  describe("AnimationEasing", () => {
    it("accepts all animation easing values", () => {
      const easings: AnimationEasing[] = ["linear", "ease_in", "ease_out", "ease_in_out", "bounce"];
      expect(new Set(easings).size).toBe(5);
    });
  });
});
