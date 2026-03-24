import { describe, it, expect } from "vitest";
import type { OverlayMode } from "./overlay-mode.contract";

describe("contracts/generator/overlay-mode", () => {
  describe("OverlayMode", () => {
    it("accepts all overlay mode values", () => {
      const modes: OverlayMode[] = [
        "center",
        "blend",
        "halftone",
        "halftone-dithered",
        "mosaic",
        "gapfill",
        "brightness",
        "duotone",
        "subpixel",
        "dithered",
        "blue-noise",
        "pixelate",
        "outline",
        "wave",
        "subpixel-size",
        "dither",
        "extreme",
        "artwork",
      ];
      expect(new Set(modes).size).toBe(18);
    });

    it("accepts center mode", () => {
      const mode: OverlayMode = "center";
      expect(mode).toBe("center");
    });

    it("accepts halftone variants", () => {
      const modes: OverlayMode[] = ["halftone", "halftone-dithered"];
      expect(modes).toHaveLength(2);
    });

    it("accepts dither variants", () => {
      const modes: OverlayMode[] = ["dithered", "dither", "blue-noise"];
      expect(modes).toHaveLength(3);
    });

    it("accepts subpixel variants", () => {
      const modes: OverlayMode[] = ["subpixel", "subpixel-size"];
      expect(modes).toHaveLength(2);
    });

    it("accepts artwork mode", () => {
      const mode: OverlayMode = "artwork";
      expect(mode).toBe("artwork");
    });
  });
});
