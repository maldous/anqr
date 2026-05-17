/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { resolveModalities } = await import("./resolve-modalities.mjs");

describe("resolveModalities", () => {
  it("should return input_modalities from architecture", () => {
    const raw = { architecture: { input_modalities: ["text", "image"] } };
    expect(resolveModalities(raw, "input")).toEqual(["text", "image"]);
  });

  it("should return output_modalities from architecture", () => {
    const raw = { architecture: { output_modalities: ["text"] } };
    expect(resolveModalities(raw, "output")).toEqual(["text"]);
  });

  it("should fall back to top-level modalities", () => {
    const raw = { input_modalities: ["text"] };
    expect(resolveModalities(raw, "input")).toEqual(["text"]);
  });

  it("should return empty array when no modalities found", () => {
    expect(resolveModalities({}, "input")).toEqual([]);
    expect(resolveModalities(null, "input")).toEqual([]);
    expect(resolveModalities(undefined, "input")).toEqual([]);
  });

  it("should prefer architecture over top-level", () => {
    const raw = {
      architecture: { input_modalities: ["text", "image"] },
      input_modalities: ["text"],
    };
    expect(resolveModalities(raw, "input")).toEqual(["text", "image"]);
  });

  it("should handle non-array architecture modalities", () => {
    const raw = { architecture: { input_modalities: "text" } };
    expect(resolveModalities(raw, "input")).toEqual([]);
  });
});
