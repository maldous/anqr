/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { sortRankedEntries } = await import("./sort-ranked-entries.mjs");

describe("sortRankedEntries", () => {
  const makeEntry = (overrides = {}) => ({
    name: "default",
    score: 0,
    toolConfirmed: false,
    selections: 0,
    ...overrides,
  });

  it("should sort by score descending", () => {
    const entries = [
      makeEntry({ name: "a", score: 1 }),
      makeEntry({ name: "b", score: 3 }),
      makeEntry({ name: "c", score: 2 }),
    ];
    entries.sort(sortRankedEntries);
    expect(entries.map((e) => e.name)).toEqual(["b", "c", "a"]);
  });

  it("should sort by toolConfirmed when scores tie", () => {
    const entries = [
      makeEntry({ name: "a", score: 1, toolConfirmed: false }),
      makeEntry({ name: "b", score: 1, toolConfirmed: true }),
    ];
    entries.sort(sortRankedEntries);
    expect(entries.map((e) => e.name)).toEqual(["b", "a"]);
  });

  it("should sort by selections when score and toolConfirmed tie", () => {
    const entries = [
      makeEntry({ name: "a", score: 1, selections: 2 }),
      makeEntry({ name: "b", score: 1, selections: 5 }),
    ];
    entries.sort(sortRankedEntries);
    expect(entries.map((e) => e.name)).toEqual(["b", "a"]);
  });

  it("should sort alphabetically as final tiebreaker", () => {
    const entries = [
      makeEntry({ name: "z", score: 1 }),
      makeEntry({ name: "a", score: 1 }),
    ];
    entries.sort(sortRankedEntries);
    expect(entries.map((e) => e.name)).toEqual(["a", "z"]);
  });

  it("should handle entries with missing score", () => {
    const entries = [
      makeEntry({ name: "a", score: 5 }),
      makeEntry({ name: "b", score: undefined }),
    ];
    entries.sort(sortRankedEntries);
    expect(entries.map((e) => e.name)).toEqual(["a", "b"]);
  });
});
