import { describe, it, expect } from "vitest";
import type { AlignmentStyle } from "./alignment-style.contract";

describe("contracts/generator/alignment-style", () => {
  describe("AlignmentStyle", () => {
    it("accepts all alignment style values", () => {
      const styles: AlignmentStyle[] = ["match_finder", "square", "rounded", "circle"];
      expect(new Set(styles).size).toBe(4);
    });
  });
});
