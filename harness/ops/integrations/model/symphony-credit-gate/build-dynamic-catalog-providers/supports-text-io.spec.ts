/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { supportsTextIO } = await import("./supports-text-io.mjs");

describe("supportsTextIO", () => {
  it("should return true when no modalities specified", () => {
    expect(supportsTextIO({})).toBe(true);
    expect(supportsTextIO(null)).toBe(true);
    expect(supportsTextIO(undefined)).toBe(true);
  });

  it("should return true when text is in both modalities", () => {
    const raw = { architecture: { input_modalities: ["text"], output_modalities: ["text"] } };
    expect(supportsTextIO(raw)).toBe(true);
  });

  it("should return false when text is not in input modalities", () => {
    const raw = { architecture: { input_modalities: ["image"], output_modalities: ["text"] } };
    expect(supportsTextIO(raw)).toBe(false);
  });

  it("should return false when text is not in output modalities", () => {
    const raw = { architecture: { input_modalities: ["text"], output_modalities: ["audio"] } };
    expect(supportsTextIO(raw)).toBe(false);
  });

  it("should return false for pure vision models", () => {
    const raw = {
      architecture: {
        input_modalities: ["image"],
        output_modalities: ["image"],
      },
    };
    expect(supportsTextIO(raw)).toBe(false);
  });
});
