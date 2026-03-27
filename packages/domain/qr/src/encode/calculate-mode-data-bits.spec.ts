import { describe, it, expect } from "vitest";
import { calculateModeDataBits } from "./calculate-mode-data-bits";

describe("calculateModeDataBits", () => {
  describe("numeric mode", () => {
    it("should calculate bits for numeric data divisible by 3", () => {
      expect(calculateModeDataBits("numeric", 3)).toBe(10);
      expect(calculateModeDataBits("numeric", 6)).toBe(20);
      expect(calculateModeDataBits("numeric", 9)).toBe(30);
    });

    it("should calculate bits for numeric data with remainder 1", () => {
      expect(calculateModeDataBits("numeric", 1)).toBe(4);
      expect(calculateModeDataBits("numeric", 4)).toBe(14);
      expect(calculateModeDataBits("numeric", 7)).toBe(24);
    });

    it("should calculate bits for numeric data with remainder 2", () => {
      expect(calculateModeDataBits("numeric", 2)).toBe(7);
      expect(calculateModeDataBits("numeric", 5)).toBe(17);
      expect(calculateModeDataBits("numeric", 8)).toBe(27);
    });
  });

  describe("alphanumeric mode", () => {
    it("should calculate bits for even-length alphanumeric data", () => {
      expect(calculateModeDataBits("alphanumeric", 2)).toBe(11);
      expect(calculateModeDataBits("alphanumeric", 4)).toBe(22);
      expect(calculateModeDataBits("alphanumeric", 6)).toBe(33);
    });

    it("should calculate bits for odd-length alphanumeric data", () => {
      expect(calculateModeDataBits("alphanumeric", 1)).toBe(6);
      expect(calculateModeDataBits("alphanumeric", 3)).toBe(17);
      expect(calculateModeDataBits("alphanumeric", 5)).toBe(28);
    });
  });

  describe("byte mode", () => {
    it("should calculate bits for byte data", () => {
      expect(calculateModeDataBits("byte", 1)).toBe(8);
      expect(calculateModeDataBits("byte", 5)).toBe(40);
      expect(calculateModeDataBits("byte", 10)).toBe(80);
      expect(calculateModeDataBits("byte", 100)).toBe(800);
    });
  });

  describe("kanji mode", () => {
    it("should calculate bits for kanji data", () => {
      expect(calculateModeDataBits("kanji", 1)).toBe(13);
      expect(calculateModeDataBits("kanji", 5)).toBe(65);
      expect(calculateModeDataBits("kanji", 10)).toBe(130);
    });
  });
});
