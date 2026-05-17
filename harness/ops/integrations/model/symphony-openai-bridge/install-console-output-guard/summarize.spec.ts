/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { summarize } = await import("./summarize.mjs");

describe("summarize", () => {
  it("should return null/undefined as-is", () => {
    expect(summarize(null)).toBe(null);
    expect(summarize(undefined)).toBe(undefined);
  });

  it("should trim strings", () => {
    const long = "a".repeat(500);
    const result = summarize(long);
    expect(result.length).toBeLessThan(250); // trimString(default 240) + …
  });

  it("should pass through numbers and booleans", () => {
    expect(summarize(42)).toBe(42);
    expect(summarize(true)).toBe(true);
    expect(summarize(false)).toBe(false);
  });

  it("should convert functions and symbols to type string", () => {
    expect(summarize(() => {})).toBe("[function]");
    expect(summarize(Symbol("test"))).toBe("[symbol]");
  });

  it("should extract Error fields", () => {
    const err = new Error("test error");
    (err as any).statusCode = 500;
    const result = summarize(err) as Record<string, unknown>;
    expect(result.name).toBe("Error");
    expect(result.message).toBe("test error");
    expect(result.statusCode).toBe(500);
  });

  it("should handle arrays", () => {
    const result = summarize([1, 2, 3]) as unknown[];
    expect(result).toEqual([1, 2, 3]);
  });

  it("should truncate long arrays", () => {
    const result = summarize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) as unknown[];
    expect(result.length).toBe(8);
  });

  it("should detect circular references", () => {
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    const result = summarize(obj) as Record<string, unknown>;
    expect(result.self).toBe("[circular]");
  });

  it("should limit object depth", () => {
    const obj = { a: { b: { c: { d: "deep" } } } };
    const result = summarize(obj) as Record<string, unknown>;
    // depth 0 → a, depth 1 → b, depth 2 returns keys summary
    expect((result as any).a.b).toMatch(/^\[object keys:/);
  });
});
