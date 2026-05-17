/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { parsePositiveInteger } = await import("./parse-positive-integer.mjs");

describe("parsePositiveInteger", () => {
  it("should parse positive integers", () => {
    expect(parsePositiveInteger("42")).toBe(42);
    expect(parsePositiveInteger(42)).toBe(42);
    expect(parsePositiveInteger("1")).toBe(1);
  });

  it("should return null for zero", () => {
    expect(parsePositiveInteger("0")).toBeNull();
    expect(parsePositiveInteger(0)).toBeNull();
  });

  it("should return null for negative numbers", () => {
    expect(parsePositiveInteger("-5")).toBeNull();
    expect(parsePositiveInteger(-5)).toBeNull();
  });

  it("should return null for non-numeric input", () => {
    expect(parsePositiveInteger("abc")).toBeNull();
    expect(parsePositiveInteger("")).toBeNull();
    expect(parsePositiveInteger(null)).toBeNull();
    expect(parsePositiveInteger(undefined)).toBeNull();
  });

  it("should parse from object with valueOf", () => {
    expect(parsePositiveInteger(" 10 ")).toBe(10);
  });
});
