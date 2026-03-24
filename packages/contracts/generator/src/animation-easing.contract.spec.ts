import { describe, it, expect } from "vitest";
import type { AnimationEasing } from "./animation-easing.contract";

describe("contracts/generator/animation-easing", () => {
  describe("AnimationEasing", () => {
    it("accepts all animation easing values", () => {
      const easings: AnimationEasing[] = ["linear", "ease_in", "ease_out", "ease_in_out", "bounce"];
      expect(new Set(easings).size).toBe(5);
    });

    it("accepts linear easing", () => {
      const easing: AnimationEasing = "linear";
      expect(easing).toBe("linear");
    });

    it("accepts ease_in easing", () => {
      const easing: AnimationEasing = "ease_in";
      expect(easing).toBe("ease_in");
    });

    it("accepts ease_out easing", () => {
      const easing: AnimationEasing = "ease_out";
      expect(easing).toBe("ease_out");
    });

    it("accepts ease_in_out easing", () => {
      const easing: AnimationEasing = "ease_in_out";
      expect(easing).toBe("ease_in_out");
    });

    it("accepts bounce easing", () => {
      const easing: AnimationEasing = "bounce";
      expect(easing).toBe("bounce");
    });
  });
});
