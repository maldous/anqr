/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { resolveKnownFileName } = await import("./resolve-known-file-name.mjs");

const validFiles = [
  "src/index.ts",
  "package.json",
  "harness/ops/README.md",
  "README.md",
];

describe("resolveKnownFileName", () => {
  it("should return exact match", () => {
    expect(resolveKnownFileName("src/index.ts", validFiles)).toBe("src/index.ts");
  });

  it("should return basename match", () => {
    expect(resolveKnownFileName("README.md", validFiles)).toBe("README.md");
  });

  it("should return null when no match found", () => {
    expect(resolveKnownFileName("nonexistent.ts", validFiles)).toBeNull();
    expect(resolveKnownFileName("src/foo.ts", validFiles)).toBeNull();
  });

  it("should handle empty validFiles", () => {
    expect(resolveKnownFileName("test.txt", [])).toBeNull();
  });
});
