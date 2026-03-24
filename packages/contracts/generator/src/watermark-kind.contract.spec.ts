import { describe, it, expect } from "vitest";
import type { WatermarkKind } from "./watermark-kind.contract";

describe("contracts/generator/watermark-kind", () => {
  describe("WatermarkKind", () => {
    it("accepts 'text' watermark kind", () => {
      const kind: WatermarkKind = "text";
      expect(kind).toBe("text");
    });

    it("accepts 'image' watermark kind", () => {
      const kind: WatermarkKind = "image";
      expect(kind).toBe("image");
    });

    it("accepts 'pattern' watermark kind", () => {
      const kind: WatermarkKind = "pattern";
      expect(kind).toBe("pattern");
    });

    it("has exactly 3 watermark kind values", () => {
      const allKinds: WatermarkKind[] = ["text", "image", "pattern"];
      expect(new Set(allKinds).size).toBe(3);
    });
  });
});
