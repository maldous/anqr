import { describe, it, expect } from "vitest";
import { getMaskFunction } from "../spec/masks";

describe("getMaskFunction", () => {
  it("returns function for mask pattern 0", () => {
    const maskFn = getMaskFunction(0);
    expect(typeof maskFn).toBe("function");
    expect(maskFn(0, 0)).toBe(true); // (0+0) % 2 === 0
    expect(maskFn(0, 1)).toBe(false); // (0+1) % 2 !== 0
    expect(maskFn(1, 1)).toBe(true); // (1+1) % 2 === 0
  });

  it("returns function for mask pattern 1", () => {
    const maskFn = getMaskFunction(1);
    expect(maskFn(0, 0)).toBe(true); // 0 % 2 === 0
    expect(maskFn(0, 5)).toBe(true); // 0 % 2 === 0
    expect(maskFn(1, 0)).toBe(false); // 1 % 2 !== 0
    expect(maskFn(2, 0)).toBe(true); // 2 % 2 === 0
  });

  it("returns function for mask pattern 2", () => {
    const maskFn = getMaskFunction(2);
    expect(maskFn(0, 0)).toBe(true); // 0 % 3 === 0
    expect(maskFn(0, 3)).toBe(true); // 3 % 3 === 0
    expect(maskFn(0, 1)).toBe(false); // 1 % 3 !== 0
  });

  it("returns function for mask pattern 3", () => {
    const maskFn = getMaskFunction(3);
    expect(maskFn(0, 0)).toBe(true); // (0+0) % 3 === 0
    expect(maskFn(1, 2)).toBe(true); // (1+2) % 3 === 0
    expect(maskFn(1, 1)).toBe(false); // (1+1) % 3 !== 0
  });

  it("returns function for mask pattern 4", () => {
    const maskFn = getMaskFunction(4);
    expect(maskFn(0, 0)).toBe(true);
    expect(typeof maskFn(2, 3)).toBe("boolean");
  });

  it("returns function for mask pattern 5", () => {
    const maskFn = getMaskFunction(5);
    expect(maskFn(0, 0)).toBe(true);
    expect(typeof maskFn(2, 3)).toBe("boolean");
  });

  it("returns function for mask pattern 6", () => {
    const maskFn = getMaskFunction(6);
    expect(maskFn(0, 0)).toBe(true);
    expect(typeof maskFn(2, 3)).toBe("boolean");
  });

  it("returns function for mask pattern 7", () => {
    const maskFn = getMaskFunction(7);
    expect(maskFn(0, 0)).toBe(true);
    expect(typeof maskFn(2, 3)).toBe("boolean");
  });

  it("throws error for invalid mask pattern", () => {
    expect(() => getMaskFunction(-1)).toThrow();
    expect(() => getMaskFunction(8)).toThrow();
    expect(() => getMaskFunction(10)).toThrow();
  });

  it("all masks return boolean values", () => {
    for (let pattern = 0; pattern <= 7; pattern++) {
      const maskFn = getMaskFunction(pattern);
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          expect(typeof maskFn(i, j)).toBe("boolean");
        }
      }
    }
  });
});
