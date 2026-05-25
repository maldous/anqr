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

    it("accepts sierra variants", () => {
      const variants: DiffusionKernel[] = ["sierra", "sierra_2", "sierra_lite"];
      expect(variants).toHaveLength(3);
    });
  });
});
