import { describe, it, expect } from "vitest";
import type { QROutputOptions } from "./qr-output-options.contract";

describe("qr-output-options.contract", () => {
  describe("QROutputOptions interface", () => {
    it("should accept valid output options", () => {
      const options: QROutputOptions = {
        format: "png",
        widthPx: 400,
        heightPx: 400,
        quality: 0.9,
        filename: "qr-code.png",
        includeQuietZone: true,
        dpi: 300,
        bgOverride: "#ffffff",
        gifPaletteSize: 256,
        gifQuantizer: "neuquant",
        gifDither: "floyd",
        gifTransparentColor: "",
        gifDisposal: "background",
        svgTrueVector: true,
        svgShapePrecision: 2,
        svgEmbedRasterOverlay: false,
      };
      expect(options.format).toBe("png");
      expect(options.widthPx).toBe(400);
      expect(options.quality).toBe(0.9);
    });

    it("should support various output formats", () => {
      const pngOptions: QROutputOptions["format"] = "png";
      const svgOptions: QROutputOptions["format"] = "svg";
      const webpOptions: QROutputOptions["format"] = "webp";

      expect(pngOptions).toBe("png");
      expect(svgOptions).toBe("svg");
      expect(webpOptions).toBe("webp");
    });

    it("should support GIF-specific options", () => {
      const gifOptions: QROutputOptions = {
        format: "gif",
        widthPx: 400,
        heightPx: 400,
        quality: 1.0,
        filename: "qr.gif",
        includeQuietZone: true,
        dpi: 72,
        bgOverride: "",
        gifPaletteSize: 128,
        gifQuantizer: "octree",
        gifDither: "off",
        gifTransparentColor: "#ffffff",
        gifDisposal: "none",
        svgTrueVector: false,
        svgShapePrecision: 1,
        svgEmbedRasterOverlay: false,
      };
      expect(gifOptions.gifPaletteSize).toBe(128);
      expect(gifOptions.gifQuantizer).toBe("octree");
    });
  });
});
