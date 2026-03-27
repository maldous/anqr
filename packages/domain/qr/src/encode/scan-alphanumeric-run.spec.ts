import { describe, it, expect } from "vitest";
import { scanAlphanumericRun } from "./scan-alphanumeric-run";

describe("scanAlphanumericRun", () => {
  it("should scan valid alphanumeric characters", () => {
    const text = "ABC123";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(6);
  });

  it("should stop at lowercase characters", () => {
    const text = "ABCabc";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(3);
  });

  it("should accept space character", () => {
    const text = "ABC DEF";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(7);
  });

  it("should accept special alphanumeric characters", () => {
    const text = "$%*+-./:";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(8);
  });

  it("should handle empty string", () => {
    expect(scanAlphanumericRun("", "", 0)).toBe(0);
  });

  it("should scan from middle of string", () => {
    const text = "abc123DEF";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 3);
    expect(result).toBe(9);
  });

  it("should stop at invalid characters", () => {
    const text = "ABC@DEF";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(3);
  });

  it("should handle URL-like strings", () => {
    const text = "HTTP://EXAMPLE.COM";
    const result = scanAlphanumericRun(text, text.toUpperCase(), 0);
    expect(result).toBe(18);
  });
});
