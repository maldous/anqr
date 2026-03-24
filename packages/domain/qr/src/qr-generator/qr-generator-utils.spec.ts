import { describe, it, expect } from "vitest";
import { hashString } from "./hash-string";
import { clampN } from "./clamp-n";
import { darkenColor } from "./darken-color";
import { lightenColor } from "./lighten-color";

describe("domain/qr/generator utilities", () => {
  describe("hashString (djb2)", () => {
    it("returns 5381 for empty string", () => {
      expect(hashString("")).toBe(5381);
    });

    it("is deterministic", () => {
      expect(hashString("hello")).toBe(hashString("hello"));
      expect(hashString("anqr")).toBe(hashString("anqr"));
    });

    it("produces different hashes for different strings", () => {
      const hashes = new Set(["a", "b", "ab", "ba", "hello", "world"].map(hashString));
      expect(hashes.size).toBe(6);
    });

    it("returns an unsigned 32-bit integer", () => {
      const hash = hashString("test string with some length");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe("clampN", () => {
    it("returns value when within range", () => {
      expect(clampN(5, 0, 10)).toBe(5);
      expect(clampN(0, 0, 10)).toBe(0);
      expect(clampN(10, 0, 10)).toBe(10);
    });

    it("clamps to lower bound", () => {
      expect(clampN(-1, 0, 10)).toBe(0);
      expect(clampN(-100, 0, 10)).toBe(0);
    });

    it("clamps to upper bound", () => {
      expect(clampN(11, 0, 10)).toBe(10);
      expect(clampN(1000, 0, 10)).toBe(10);
    });

    it("works with negative ranges", () => {
      expect(clampN(0, -10, -5)).toBe(-5);
      expect(clampN(-20, -10, -5)).toBe(-10);
      expect(clampN(-7, -10, -5)).toBe(-7);
    });

    it("works with fractional values", () => {
      expect(clampN(0.5, 0, 1)).toBe(0.5);
      expect(clampN(1.5, 0, 1)).toBe(1);
    });
  });

  describe("darkenColor", () => {
    it("factor 0 leaves color unchanged", () => {
      expect(darkenColor("ffffff", 0)).toBe("rgb(255,255,255)");
    });

    it("factor 1 produces black", () => {
      expect(darkenColor("ffffff", 1)).toBe("rgb(0,0,0)");
    });

    it("factor 0.5 halves the RGB values", () => {
      expect(darkenColor("ff8040", 0.5)).toBe("rgb(128,64,32)");
    });

    it("handles # prefix", () => {
      expect(darkenColor("#ffffff", 0)).toBe("rgb(255,255,255)");
    });

    it("black stays black at any factor", () => {
      expect(darkenColor("000000", 0.5)).toBe("rgb(0,0,0)");
    });
  });

  describe("lightenColor", () => {
    it("factor 0 leaves color unchanged", () => {
      expect(lightenColor("000000", 0)).toBe("rgb(0,0,0)");
    });

    it("factor 1 produces white from black", () => {
      expect(lightenColor("000000", 1)).toBe("rgb(255,255,255)");
    });

    it("factor 0.5 moves halfway to white", () => {
      expect(lightenColor("000000", 0.5)).toBe("rgb(128,128,128)");
    });

    it("handles # prefix", () => {
      expect(lightenColor("#000000", 1)).toBe("rgb(255,255,255)");
    });

    it("white stays white at any factor", () => {
      expect(lightenColor("ffffff", 0.5)).toBe("rgb(255,255,255)");
    });
  });
});
