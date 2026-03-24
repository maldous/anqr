import { describe, expect, it } from "vitest";
import type { FinderStyle } from "./finder-style.contract";

describe("FinderStyle", () => {
  it("should allow square", () => {
    const style: FinderStyle = "square";
    expect(style).toBe("square");
  });

  it("should allow rounded", () => {
    const style: FinderStyle = "rounded";
    expect(style).toBe("rounded");
  });

  it("should allow circle", () => {
    const style: FinderStyle = "circle";
    expect(style).toBe("circle");
  });
});
