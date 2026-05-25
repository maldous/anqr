import { describe, it, expect } from "vitest";
import type { ModuleStyle } from "./module-style.contract";

describe("contracts/generator/module-style", () => {
  describe("ModuleStyle", () => {
    it("accepts all module style values", () => {
      const styles: ModuleStyle[] = ["square", "rounded", "dots", "diamond", "connected"];
      expect(new Set(styles).size).toBe(5);
    });
  });
});
