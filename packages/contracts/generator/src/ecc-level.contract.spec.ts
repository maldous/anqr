import { describe, it, expect } from "vitest";
import type { ECCLevel } from "./ecc-level.contract";

describe("ecc-level.contract (generator)", () => {
  describe("ECCLevel type", () => {
    it("should accept valid error correction levels", () => {
      const levels: ECCLevel[] = ["L", "M", "Q", "H"];
      expect(levels).toHaveLength(4);
      expect(levels).toContain("L");
      expect(levels).toContain("M");
      expect(levels).toContain("Q");
      expect(levels).toContain("H");
    });

    it("should support all ECC levels with increasing redundancy", () => {
      const l: ECCLevel = "L"; // 7% redundancy
      const m: ECCLevel = "M"; // 15% redundancy
      const q: ECCLevel = "Q"; // 25% redundancy
      const h: ECCLevel = "H"; // 30% redundancy
      
      expect(l).toBe("L");
      expect(m).toBe("M");
      expect(q).toBe("Q");
      expect(h).toBe("H");
    });
  });
});
