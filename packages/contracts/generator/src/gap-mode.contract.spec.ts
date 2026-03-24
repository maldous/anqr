import { describe, expect, it } from "vitest";
import type { GapMode } from "./gap-mode.contract";

describe("GapMode", () => {
  it("should allow none", () => {
    const mode: GapMode = "none";
    expect(mode).toBe("none");
  });

  it("should allow inset", () => {
    const mode: GapMode = "inset";
    expect(mode).toBe("inset");
  });

  it("should allow stroke", () => {
    const mode: GapMode = "stroke";
    expect(mode).toBe("stroke");
  });

  it("should allow negative_space", () => {
    const mode: GapMode = "negative_space";
    expect(mode).toBe("negative_space");
  });
});
