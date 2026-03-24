import { describe, it, expect } from "vitest";
import type { DiffusionKernel } from "./diffusion-kernel.contract";

describe("contracts/generator/diffusion-kernel", () => {
  describe("DiffusionKernel", () => {
    it("accepts all diffusion kernel values", () => {
      const kernels: DiffusionKernel[] = [
        "floyd_steinberg",
        "jarvis_judice_ninke",
        "stucki",
        "burkes",
        "sierra",
        "sierra_2",
        "sierra_lite",
        "atkinson",
      ];
      expect(new Set(kernels).size).toBe(8);
    });

    it("accepts floyd_steinberg kernel", () => {
      const kernel: DiffusionKernel = "floyd_steinberg";
      expect(kernel).toBe("floyd_steinberg");
    });

    it("accepts jarvis_judice_ninke kernel", () => {
      const kernel: DiffusionKernel = "jarvis_judice_ninke";
      expect(kernel).toBe("jarvis_judice_ninke");
    });

    it("accepts stucki kernel", () => {
      const kernel: DiffusionKernel = "stucki";
      expect(kernel).toBe("stucki");
    });

    it("accepts burkes kernel", () => {
      const kernel: DiffusionKernel = "burkes";
      expect(kernel).toBe("burkes");
    });

    it("accepts sierra variants", () => {
      const variants: DiffusionKernel[] = ["sierra", "sierra_2", "sierra_lite"];
      expect(variants).toHaveLength(3);
    });

    it("accepts atkinson kernel", () => {
      const kernel: DiffusionKernel = "atkinson";
      expect(kernel).toBe("atkinson");
    });
  });
});
