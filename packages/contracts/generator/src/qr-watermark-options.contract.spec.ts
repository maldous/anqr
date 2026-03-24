import { describe, it, expect } from "vitest";
import type { QRWatermarkOptions } from "./qr-watermark-options.contract";

describe("qr-watermark-options.contract", () => {
  describe("QRWatermarkOptions interface", () => {
    it("should accept valid watermark options", () => {
      const options: QRWatermarkOptions = {
        enabled: true,
        kind: "text",
        text: "My Watermark",
        position: "bottom_right",
        opacity: 0.5,
        blend: "normal",
      };
      expect(options.enabled).toBe(true);
      expect(options.kind).toBe("text");
      expect(options.text).toBe("My Watermark");
      expect(options.position).toBe("bottom_right");
      expect(options.opacity).toBe(0.5);
      expect(options.blend).toBe("normal");
    });

    it("should support disabled watermark", () => {
      const options: QRWatermarkOptions = {
        enabled: false,
        kind: "",
        text: "",
        position: "",
        opacity: 0,
        blend: "",
      };
      expect(options.enabled).toBe(false);
      expect(options.opacity).toBe(0);
    });

    it("should support various watermark kinds", () => {
      const textWatermark: QRWatermarkOptions = {
        enabled: true,
        kind: "text",
        text: "Sample Text",
        position: "center",
        opacity: 0.7,
        blend: "multiply",
      };
      const imageWatermark: QRWatermarkOptions = {
        enabled: true,
        kind: "image",
        text: "",
        position: "top_left",
        opacity: 0.3,
        blend: "screen",
      };
      expect(textWatermark.kind).toBe("text");
      expect(imageWatermark.kind).toBe("image");
    });
  });
});
