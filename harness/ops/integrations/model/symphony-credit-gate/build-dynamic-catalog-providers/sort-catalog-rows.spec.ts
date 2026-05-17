import { describe, it, expect } from "vitest";

const { sortCatalogRows } = await import("./sort-catalog-rows.mjs");

describe("sortCatalogRows", () => {
  it("should prioritize tool-support over non-tool-support", () => {
    const rows = [
      { model: "a", toolSupport: "unsupported" },
      { model: "b", toolSupport: "supported" },
    ];
    rows.sort(sortCatalogRows);
    expect(rows[0].model).toBe("b");
  });

  it("should sort by context length descending", () => {
    const rows = [
      { model: "a", contextLength: 4000 },
      { model: "b", contextLength: 128000 },
    ];
    rows.sort(sortCatalogRows);
    expect(rows[0].model).toBe("b");
  });

  it("should sort alphabetically as final tiebreaker", () => {
    const rows = [
      { model: "z" },
      { model: "a" },
    ];
    rows.sort(sortCatalogRows);
    expect(rows[0].model).toBe("a");
  });
});
