import { describe, expect, it } from "vitest";
import type { GradientStop } from "./gradient-stop.contract";

describe("GradientStop", () => {
  it("should allow valid gradient stop", () => {
    const stop: GradientStop = {
      pos: 0.5,
      color: "#ff0000",
    };

    expect(stop.pos).toBe(0.5);
    expect(stop.color).toBe("#ff0000");
  });

  it("should allow start position", () => {
    const stop: GradientStop = {
      pos: 0,
      color: "#000000",
    };

    expect(stop.pos).toBe(0);
  });

  it("should allow end position", () => {
    const stop: GradientStop = {
      pos: 1,
      color: "#ffffff",
    };

    expect(stop.pos).toBe(1);
  });
});
