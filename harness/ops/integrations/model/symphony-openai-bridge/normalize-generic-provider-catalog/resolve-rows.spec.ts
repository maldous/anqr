/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { resolveRows } = await import("./resolve-rows.mjs");

describe("resolveRows", () => {
  it("should return data array when present", () => {
    expect(resolveRows({ data: [{ id: "a" }, { id: "b" }] })).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("should return models array when no data key", () => {
    expect(resolveRows({ models: [{ id: "x" }] })).toEqual([{ id: "x" }]);
  });

  it("should prefer data over models", () => {
    const payload = {
      data: [{ id: "from-data" }],
      models: [{ id: "from-models" }],
    };
    expect(resolveRows(payload)).toEqual([{ id: "from-data" }]);
  });

  it("should return plain arrays as-is", () => {
    expect(resolveRows([{ id: "a" }])).toEqual([{ id: "a" }]);
  });

  it("should return empty array for non-array payload", () => {
    expect(resolveRows({})).toEqual([]);
    expect(resolveRows(null)).toEqual([]);
    expect(resolveRows(undefined)).toEqual([]);
  });
});
