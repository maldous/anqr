import { describe, expect, it } from "vitest";
import type { GradientConfig } from "./gradient-config.contract";

describe("GradientConfig", () => {
  it("should validate linear gradient config", () => {
    const config: GradientConfig = {
      type: "linear",
      angle: 45,
      stops: [
        { pos: 0, color: "#000000" },
        { pos: 1, color: "#FFFFFF" },
      ],
    };

    expect(config.type).toBe("linear");
    expect(config.angle).toBe(45);
    expect(config.stops).toHaveLength(2);
  });

  it("should validate radial gradient config", () => {
    const config: GradientConfig = {
      type: "radial",
      stops: [
        { pos: 0, color: "#FF0000" },
        { pos: 0.5, color: "#00FF00" },
        { pos: 1, color: "#0000FF" },
      ],
    };

    expect(config.type).toBe("radial");
    expect(config.stops).toHaveLength(3);
  });

  it("should support conic gradient", () => {
    const config: GradientConfig = {
      type: "conic",
      angle: 90,
      stops: [
        { pos: 0, color: "#000000" },
        { pos: 1, color: "#FFFFFF" },
      ],
    };

    expect(config.type).toBe("conic");
  });

  it("should support none gradient type", () => {
    const config: GradientConfig = {
      type: "none",
      stops: [],
    };

    expect(config.type).toBe("none");
  });
});
