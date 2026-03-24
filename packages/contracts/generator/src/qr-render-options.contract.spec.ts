import { describe, expect, it } from "vitest";
import type { QRRenderOptions } from "./qr-render-options.contract";

describe("QRRenderOptions", () => {
  it("should validate complete render options structure", () => {
    const options: QRRenderOptions = {
      modulePx: 10,
      crispEdges: true,
      pixelSnap: "round",
      moduleGapPercent: 0,
      gapMode: "none",
      moduleStyle: "square",
      finderStyle: "square",
      alignmentStyle: "square",
      timingStyle: "solid",
      cornerRadius: 0,
      dotRotationDeg: 0,
      eyeOuterStyle: "square",
      eyeInnerStyle: "square",
      eyeScale: 1,
      frameStyle: "none",
      frameText: "",
      fgColor: "#000000",
      bgColor: "#FFFFFF",
      bgTransparent: false,
      palette: [],
      paletteMode: "none",
      gradient: { type: "none", stops: [] },
      perModuleColorMode: "none",
      contrastGuard: true,
      minContrastRatio: 4.5,
    };

    expect(options.modulePx).toBe(10);
    expect(options.crispEdges).toBe(true);
  });

  it("should support pixel snap modes", () => {
    const modes: Array<QRRenderOptions["pixelSnap"]> = ["floor", "round", "ceil"];
    expect(modes).toHaveLength(3);
  });
});
