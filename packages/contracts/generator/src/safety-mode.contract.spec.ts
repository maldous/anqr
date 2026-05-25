import { describe, it, expect } from "vitest";
import type { SafetyMode } from "./safety-mode.contract";

describe("contracts/generator/safety-mode", () => {
  describe("SafetyMode", () => {
    it("accepts all safety mode values", () => {
      const modes: SafetyMode[] = ["off", "balanced", "strict"];
      expect(new Set(modes).size).toBe(3);
    });
  });
});
