import { describe, it, expect } from "vitest";
import type { FitMode } from "./fit-mode.contract";

describe("contracts/generator/fit-mode", () => {
  describe("FitMode", () => {
    it("accepts all fit mode values", () => {
      const modes: FitMode[] = ["cover", "contain", "stretch"];
      expect(new Set(modes).size).toBe(3);
    });

    it("accepts cover mode", () => {
      const mode: FitMode = "cover";
      expect(mode).toBe("cover");
    });

    it("accepts contain mode", () => {
      const mode: FitMode = "contain";
      expect(mode).toBe("contain");
    });

    it("accepts stretch mode", () => {
      const mode: FitMode = "stretch";
      expect(mode).toBe("stretch");
    });
  });
});
