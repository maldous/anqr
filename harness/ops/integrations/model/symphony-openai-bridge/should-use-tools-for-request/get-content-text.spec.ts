/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { getContentText } = await import("./get-content-text.mjs");

describe("getContentText", () => {
  it("should return plain string as-is", () => {
    expect(getContentText("hello world")).toBe("hello world");
  });

  it("should return empty string for non-array, non-string input", () => {
    expect(getContentText(42)).toBe("");
    expect(getContentText(null)).toBe("");
    expect(getContentText(undefined)).toBe("");
    expect(getContentText({})).toBe("");
  });

  it("should extract text from array of strings", () => {
    const parts = ["hello", "world"];
    expect(getContentText(parts)).toBe("hello\nworld");
  });

  it("should extract text from array of content parts", () => {
    const parts = [{ text: "hello" }, { text: "world" }];
    expect(getContentText(parts)).toBe("hello\nworld");
  });

  it("should handle mixed array of strings and objects", () => {
    const parts = ["prefix", { text: "body" }];
    expect(getContentText(parts)).toBe("prefix\nbody");
  });

  it("should skip parts without text", () => {
    const parts = [{ type: "image_url" }, { text: "body" }];
    expect(getContentText(parts)).toBe("\nbody");
  });
});
