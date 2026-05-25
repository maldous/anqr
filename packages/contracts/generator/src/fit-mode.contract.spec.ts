import { describe, it, expect } from "vitest";
import type { FitMode } from "./fit-mode.contract";

describe("contracts/generator/fit-mode", () => {
  describe("FitMode", () => {
    it("accepts all fit mode values", () => {
      const modes: FitMode[] = ["cover", "contain", "stretch"];
      expect(new Set(modes).size).toBe(3);
    });
  });
});
