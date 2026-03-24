import { describe, it, expect } from "vitest";
import type { GradientUpdate } from "./gradient.contract";

describe("gradient.contract", () => {
  describe("GradientUpdate interface", () => {
    it("should accept valid gradient with all fields", () => {
      const gradient: GradientUpdate = {
        type: "linear",
        stops: [
          { pos: 0, color: "#ff0000" },
          { pos: 1, color: "#0000ff" },
        ],
        angle: 45,
      };
      expect(gradient.type).toBe("linear");
      expect(gradient.stops).toHaveLength(2);
      expect(gradient.angle).toBe(45);
    });

    it("should accept gradient with only type", () => {
      const gradient: GradientUpdate = {
        type: "none",
      };
      expect(gradient.type).toBe("none");
      expect(gradient.stops).toBeUndefined();
      expect(gradient.angle).toBeUndefined();
    });

    it("should support all gradient types", () => {
      const linear: GradientUpdate["type"] = "linear";
      const radial: GradientUpdate["type"] = "radial";
      const conic: GradientUpdate["type"] = "conic";
      const none: GradientUpdate["type"] = "none";
      
      expect(linear).toBe("linear");
      expect(radial).toBe("radial");
      expect(conic).toBe("conic");
      expect(none).toBe("none");
    });

    it("should support gradient with multiple stops", () => {
      const gradient: GradientUpdate = {
        type: "radial",
        stops: [
          { pos: 0, color: "#ffffff" },
          { pos: 0.5, color: "#808080" },
          { pos: 1, color: "#000000" },
        ],
        angle: 0,
      };
      expect(gradient.stops).toHaveLength(3);
      expect(gradient.stops![0].pos).toBe(0);
      expect(gradient.stops![2].pos).toBe(1);
    });
  });
});
