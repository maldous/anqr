import { describe, it, expect } from "vitest";
import type { SafetyMode } from "./safety-mode.contract";

describe("contracts/generator/safety-mode", () => {
  describe("SafetyMode", () => {
    it("accepts all safety mode values", () => {
      const modes: SafetyMode[] = ["off", "balanced", "strict"];
      expect(new Set(modes).size).toBe(3);
    });

    it("accepts off mode", () => {
      const mode: SafetyMode = "off";
      expect(mode).toBe("off");
    });

    it("accepts balanced mode", () => {
      const mode: SafetyMode = "balanced";
      expect(mode).toBe("balanced");
    });

    it("accepts strict mode", () => {
      const mode: SafetyMode = "strict";
      expect(mode).toBe("strict");
    });
  });
});
