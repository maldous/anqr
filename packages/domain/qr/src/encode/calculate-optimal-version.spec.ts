import { describe, it, expect } from "vitest";
import { calculateOptimalVersion } from "./calculate-optimal-version";

describe("calculateOptimalVersion", () => {
  it("should return version 1 for short data", () => {
    const result = calculateOptimalVersion("HELLO", "M");
    expect(result).toBe(1);
  });

  it("should return higher version for longer data", () => {
    const longData = "A".repeat(500);
    const result = calculateOptimalVersion(longData, "M");
    expect(result).toBeGreaterThan(1);
  });

  it("should return version 40 for data that's too long", () => {
    const veryLongData = "A".repeat(10000);
    const result = calculateOptimalVersion(veryLongData, "L");
    expect(result).toBe(40);
  });

  it("should work with different ECC levels", () => {
    const data = "HELLO WORLD";
    const levelL = calculateOptimalVersion(data, "L");
    const levelM = calculateOptimalVersion(data, "M");
    const levelQ = calculateOptimalVersion(data, "Q");
    const levelH = calculateOptimalVersion(data, "H");
    
    expect(levelL).toBeLessThanOrEqual(levelM);
    expect(levelM).toBeLessThanOrEqual(levelQ);
    expect(levelQ).toBeLessThanOrEqual(levelH);
  });

  it("should use default ECC level M when not specified", () => {
    const result = calculateOptimalVersion("TEST");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(40);
  });

  it("should handle numeric data efficiently", () => {
    const numericData = "123456789012345";
    const result = calculateOptimalVersion(numericData, "L");
    expect(result).toBe(1);
  });

  it("should handle alphanumeric data", () => {
    const alphaData = "HTTPS://EXAMPLE.COM";
    const result = calculateOptimalVersion(alphaData, "L");
    expect(result).toBeGreaterThan(0);
  });

  it("should handle byte data", () => {
    const byteData = "hello@example.com";
    const result = calculateOptimalVersion(byteData, "M");
    expect(result).toBeGreaterThan(0);
  });
});
