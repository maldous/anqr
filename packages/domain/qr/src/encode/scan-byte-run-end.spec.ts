import { describe, it, expect } from "vitest";
import { scanByteRunEnd } from "./scan-byte-run-end";

describe("scanByteRunEnd", () => {
  it("should scan until numeric run of 4+", () => {
    const text = "abc12345";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(3);
  });

  it("should scan until alphanumeric run of 6+", () => {
    const text = "abcABCDEF";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(3);
  });

  it("should scan entire string if no long runs", () => {
    const text = "hello world!";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(12);
  });

  it("should handle empty string", () => {
    expect(scanByteRunEnd("", "", 0)).toBe(0);
  });

  it("should scan from middle of string", () => {
    const text = "prefix123456";
    const result = scanByteRunEnd(text, text.toUpperCase(), 6);
    expect(result).toBe(6);
  });

  it("should handle short numeric runs", () => {
    const text = "a1b2c3";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(6);
  });

  it("should handle short alphanumeric runs", () => {
    const text = "abABC12";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(7);
  });

  it("should stop at start if numeric run starts there", () => {
    const text = "12345abc";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(0);
  });

  it("should stop at start if alphanumeric run starts there", () => {
    const text = "ABCDEFabc";
    const result = scanByteRunEnd(text, text.toUpperCase(), 0);
    expect(result).toBe(0);
  });
});
