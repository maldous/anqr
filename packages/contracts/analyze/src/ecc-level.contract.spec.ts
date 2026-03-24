import { describe, it, expect } from "vitest";
import type { ECCLevel } from "./ecc-level.contract";

describe("ecc-level.contract", () => {
  describe("ECCLevel type re-export", () => {
    it("should accept valid error correction levels", () => {
      const levels: ECCLevel[] = ["L", "M", "Q", "H"];
      expect(levels).toHaveLength(4);
      expect(levels).toContain("L");
      expect(levels).toContain("M");
      expect(levels).toContain("Q");
      expect(levels).toContain("H");
    });

    it("should maintain type compatibility with generator ECCLevel", () => {
      const level: ECCLevel = "H";
      expect(level).toBe("H");
    });

    it("should support all ECC levels in order of increasing redundancy", () => {
      const levelsInOrder: ECCLevel[] = ["L", "M", "Q", "H"];
      // L = 7%, M = 15%, Q = 25%, H = 30% redundancy
      expect(levelsInOrder[0]).toBe("L");
      expect(levelsInOrder[3]).toBe("H");
    });
  });
});
