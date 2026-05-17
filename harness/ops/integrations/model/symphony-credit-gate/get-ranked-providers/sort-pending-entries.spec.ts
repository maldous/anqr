/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { sortPendingEntries } = await import("./sort-pending-entries.mjs");

describe("sortPendingEntries", () => {
  const makeEntry = (overrides = {}) => ({
    name: "default",
    toolConfirmed: false,
    selections: 0,
    ...overrides,
  });

  it("should sort by toolConfirmed descending", () => {
    const entries = [
      makeEntry({ name: "a", toolConfirmed: false }),
      makeEntry({ name: "b", toolConfirmed: true }),
    ];
    entries.sort(sortPendingEntries);
    expect(entries.map((e) => e.name)).toEqual(["b", "a"]);
  });

  it("should sort by selections when toolConfirmed ties", () => {
    const entries = [
      makeEntry({ name: "a", selections: 2 }),
      makeEntry({ name: "b", selections: 5 }),
    ];
    entries.sort(sortPendingEntries);
    expect(entries.map((e) => e.name)).toEqual(["b", "a"]);
  });

  it("should sort alphabetically as final tiebreaker", () => {
    const entries = [
      makeEntry({ name: "z" }),
      makeEntry({ name: "a" }),
    ];
    entries.sort(sortPendingEntries);
    expect(entries.map((e) => e.name)).toEqual(["a", "z"]);
  });
});
