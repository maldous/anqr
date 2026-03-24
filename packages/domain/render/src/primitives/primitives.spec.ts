import { describe, it, expect } from "vitest";
import { clamp } from "./clamp";
import { clamp01 } from "./clamp01";
import { createRNG } from "./create-rng";
import { createSeededRandom } from "./create-seeded-random";
import { lerp } from "./lerp";
import * as math from "./math";
import * as index from "./index";

describe("domain/render/primitives", () => {
  describe("clamp", () => {
    it("returns values within 0-255 unchanged (after rounding)", () => {
      expect(clamp(0)).toBe(0);
      expect(clamp(128)).toBe(128);
      expect(clamp(255)).toBe(255);
    });

    it("clamps negative values to 0", () => {
      expect(clamp(-1)).toBe(0);
      expect(clamp(-100)).toBe(0);
      expect(clamp(-Infinity)).toBe(0);
    });

    it("clamps values above 255 to 255", () => {
      expect(clamp(256)).toBe(255);
      expect(clamp(1000)).toBe(255);
      expect(clamp(Infinity)).toBe(255);
    });

    it("rounds fractional values to nearest integer", () => {
      expect(clamp(0.4)).toBe(0);
      expect(clamp(0.5)).toBe(1);
      expect(clamp(127.49)).toBe(127);
      expect(clamp(127.5)).toBe(128);
      expect(clamp(254.6)).toBe(255);
    });

    it("rounds then clamps at boundaries", () => {
      expect(clamp(-0.4)).toBe(0);
      expect(clamp(255.4)).toBe(255);
      expect(clamp(255.6)).toBe(255);
    });
  });

  describe("clamp01", () => {
    it("returns values within 0-1 unchanged", () => {
      expect(clamp01(0)).toBe(0);
      expect(clamp01(0.5)).toBe(0.5);
      expect(clamp01(1)).toBe(1);
    });

    it("clamps negative values to 0", () => {
      expect(clamp01(-0.001)).toBe(0);
      expect(clamp01(-1)).toBe(0);
      expect(clamp01(-100)).toBe(0);
    });

    it("clamps values above 1 to 1", () => {
      expect(clamp01(1.001)).toBe(1);
      expect(clamp01(2)).toBe(1);
      expect(clamp01(999)).toBe(1);
    });

    it("preserves fractional precision (no rounding)", () => {
      expect(clamp01(0.123456789)).toBe(0.123456789);
      expect(clamp01(0.999999999)).toBe(0.999999999);
    });

    it("handles boundary float values", () => {
      expect(clamp01(Number.EPSILON)).toBe(Number.EPSILON);
      expect(clamp01(1 - Number.EPSILON)).toBe(1 - Number.EPSILON);
    });
  });

  describe("createRNG (mulberry32)", () => {
    it("returns a function", () => {
      const rng = createRNG(42);
      expect(typeof rng).toBe("function");
    });

    it("produces values in [0, 1)", () => {
      const rng = createRNG(12345);
      for (let i = 0; i < 1000; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it("is deterministic — same seed produces same sequence", () => {
      const a = createRNG(42);
      const b = createRNG(42);
      for (let i = 0; i < 100; i++) {
        expect(a()).toBe(b());
      }
    });

    it("different seeds produce different sequences", () => {
      const a = createRNG(1);
      const b = createRNG(2);
      const seqA = Array.from({ length: 10 }, () => a());
      const seqB = Array.from({ length: 10 }, () => b());
      expect(seqA).not.toEqual(seqB);
    });

    it("produces reasonable distribution across [0, 1)", () => {
      const rng = createRNG(777);
      const buckets = [0, 0, 0, 0];
      const n = 4000;
      for (let i = 0; i < n; i++) {
        const v = rng();
        buckets[Math.min(3, Math.floor(v * 4))]++;
      }
      for (const count of buckets) {
        expect(count).toBeGreaterThan(n / 4 - n * 0.1);
        expect(count).toBeLessThan(n / 4 + n * 0.1);
      }
    });

    it("handles seed 0", () => {
      const rng = createRNG(0);
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });

    it("handles large seed values", () => {
      const rng = createRNG(2 ** 32 - 1);
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });

    it("handles negative seed values", () => {
      const rng = createRNG(-42);
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  describe("createSeededRandom (sine-based)", () => {
    it("returns a function", () => {
      const rng = createSeededRandom(42);
      expect(typeof rng).toBe("function");
    });

    it("produces values in [0, 1)", () => {
      const rng = createSeededRandom(12345);
      for (let i = 0; i < 1000; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it("is deterministic — same seed produces same sequence", () => {
      const a = createSeededRandom(42);
      const b = createSeededRandom(42);
      for (let i = 0; i < 100; i++) {
        expect(a()).toBe(b());
      }
    });

    it("different seeds produce different sequences", () => {
      const a = createSeededRandom(1);
      const b = createSeededRandom(2);
      const seqA = Array.from({ length: 10 }, () => a());
      const seqB = Array.from({ length: 10 }, () => b());
      expect(seqA).not.toEqual(seqB);
    });

    it("handles seed 0", () => {
      const rng = createSeededRandom(0);
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });

    it("produces distinct values over successive calls", () => {
      const rng = createSeededRandom(99);
      const values = new Set(Array.from({ length: 50 }, () => rng()));
      expect(values.size).toBeGreaterThan(40);
    });
  });

  describe("lerp", () => {
    it("returns a when t = 0", () => {
      expect(lerp(10, 20, 0)).toBe(10);
      expect(lerp(-5, 5, 0)).toBe(-5);
    });

    it("returns b when t = 1", () => {
      expect(lerp(10, 20, 1)).toBe(20);
      expect(lerp(-5, 5, 1)).toBe(5);
    });

    it("returns midpoint when t = 0.5", () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(10, 20, 0.5)).toBe(15);
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });

    it("interpolates at arbitrary t values", () => {
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(0, 100, 0.75)).toBe(75);
      expect(lerp(0, 100, 0.1)).toBeCloseTo(10);
    });

    it("extrapolates when t < 0", () => {
      expect(lerp(10, 20, -1)).toBe(0);
    });

    it("extrapolates when t > 1", () => {
      expect(lerp(10, 20, 2)).toBe(30);
    });

    it("works with negative ranges", () => {
      expect(lerp(-100, -200, 0.5)).toBe(-150);
    });

    it("returns a when a equals b regardless of t", () => {
      expect(lerp(42, 42, 0)).toBe(42);
      expect(lerp(42, 42, 0.5)).toBe(42);
      expect(lerp(42, 42, 1)).toBe(42);
    });
  });

  describe("math barrel re-exports", () => {
    it("exports clamp", () => {
      expect(math.clamp).toBe(clamp);
    });

    it("exports clamp01", () => {
      expect(math.clamp01).toBe(clamp01);
    });

    it("exports createSeededRandom", () => {
      expect(math.createSeededRandom).toBe(createSeededRandom);
    });

    it("exports lerp", () => {
      expect(math.lerp).toBe(lerp);
    });

    it("exports createRNG", () => {
      expect(math.createRNG).toBe(createRNG);
    });

    it("exports exactly 5 members", () => {
      expect(Object.keys(math).sort()).toEqual([
        "clamp",
        "clamp01",
        "createRNG",
        "createSeededRandom",
        "lerp",
      ]);
    });
  });

  describe("index re-exports", () => {
    it("exports createRNG", () => {
      expect(index.createRNG).toBe(createRNG);
    });

    it("exports createSeededRandom", () => {
      expect(index.createSeededRandom).toBe(createSeededRandom);
    });

    it("exports exactly 2 members", () => {
      expect(Object.keys(index).sort()).toEqual([
        "createRNG",
        "createSeededRandom",
      ]);
    });
  });
});
