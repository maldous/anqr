import { describe, expect, it } from "vitest";
import type { GradientType } from "./gradient-type.contract";

describe("GradientType", () => {
  it("should allow none", () => {
    const type: GradientType = "none";
    expect(type).toBe("none");
  });

  it("should allow linear", () => {
    const type: GradientType = "linear";
    expect(type).toBe("linear");
  });

  it("should allow radial", () => {
    const type: GradientType = "radial";
    expect(type).toBe("radial");
  });

  it("should allow conic", () => {
    const type: GradientType = "conic";
    expect(type).toBe("conic");
  });
});
