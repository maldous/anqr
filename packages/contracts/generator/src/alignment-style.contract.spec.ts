import { describe, it, expect } from "vitest";
import type { AlignmentStyle } from "./alignment-style.contract";

describe("contracts/generator/alignment-style", () => {
  describe("AlignmentStyle", () => {
    it("accepts all alignment style values", () => {
      const styles: AlignmentStyle[] = ["match_finder", "square", "rounded", "circle"];
      expect(new Set(styles).size).toBe(4);
    });

    it("accepts match_finder style", () => {
      const style: AlignmentStyle = "match_finder";
      expect(style).toBe("match_finder");
    });

    it("accepts square style", () => {
      const style: AlignmentStyle = "square";
      expect(style).toBe("square");
    });

    it("accepts rounded style", () => {
      const style: AlignmentStyle = "rounded";
      expect(style).toBe("rounded");
    });

    it("accepts circle style", () => {
      const style: AlignmentStyle = "circle";
      expect(style).toBe("circle");
    });
  });
});
