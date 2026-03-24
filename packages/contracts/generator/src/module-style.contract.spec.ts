import { describe, it, expect } from "vitest";
import type { ModuleStyle } from "./module-style.contract";

describe("contracts/generator/module-style", () => {
  describe("ModuleStyle", () => {
    it("accepts all module style values", () => {
      const styles: ModuleStyle[] = ["square", "rounded", "dots", "diamond", "connected"];
      expect(new Set(styles).size).toBe(5);
    });

    it("accepts square style", () => {
      const style: ModuleStyle = "square";
      expect(style).toBe("square");
    });

    it("accepts rounded style", () => {
      const style: ModuleStyle = "rounded";
      expect(style).toBe("rounded");
    });

    it("accepts dots style", () => {
      const style: ModuleStyle = "dots";
      expect(style).toBe("dots");
    });

    it("accepts diamond style", () => {
      const style: ModuleStyle = "diamond";
      expect(style).toBe("diamond");
    });

    it("accepts connected style", () => {
      const style: ModuleStyle = "connected";
      expect(style).toBe("connected");
    });
  });
});
