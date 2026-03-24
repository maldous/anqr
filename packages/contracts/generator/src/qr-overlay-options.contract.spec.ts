import { describe, expect, it } from "vitest";
import type { QROverlayOptions } from "./qr-overlay-options.contract";

describe("QROverlayOptions", () => {
  it("should validate complete overlay options structure", () => {
    const options: QROverlayOptions = {
      enabled: true,
      url: "https://example.com/overlay.png",
      cropEnabled: false,
      cropRegion: { x: 0, y: 0, size: 1 },
      fit: "contain",
      rotateDeg: 0,
      flipX: false,
      flipY: false,
      colorMode: "default",
      invert: false,
      brightness: 0,
      contrast: 0,
      gamma: 1,
      saturation: 0,
      hueRotateDeg: 0,
      blurPx: 0,
      sharpen: 0,
      posterizeLevels: 0,
      threshold: 128,
      edgeDetect: "off",
      mode: "dithered",
      type: "photo",
      intensity: 50,
      preserveFinders: true,
      preserveTiming: true,
      preserveAlignment: true,
      protectFormatInfo: true,
      protectVersionInfo: true,
      framePick: "first",
      ditherKind: "floyd-steinberg",
      ditherStrength: 100,
      finderDitherStrength: 50,
      blendPreservations: true,
      blendPreservationMode: "overlay",
      ditherSerpentine: true,
      diffusionKernel: "floyd-steinberg",
      orderedMatrix: "bayer-2x2",
      blueNoiseTileSize: 64,
      blueNoiseSeed: 42,
      colorDither: "none",
      subpixelGridSize: "3x3",
      subpixelCenterRule: "majority",
      subpixelNeutralColor: "#808080",
      subpixelFinderOverride: "none",
      halftoneCell: "per_module",
      halftoneDotShape: "circle",
      duotoneColors: ["#000000", "#FFFFFF"],
      brightnessCurve: "linear",
      eccAwareEnabled: false,
      eccAwareRiskBudget: 0.5,
      eccAwareWeightMap: "default",
      gifUseFrameDelays: true,
      gifMaxFps: 30,
      gifDisposalHandling: "respect",
      qrFirstMode: false,
      qrartIterations: 100,
      qrartFragmentLength: 8,
      qrartSeed: 12345,
    };

    expect(options).toBeDefined();
    expect(options.enabled).toBe(true);
    expect(options.url).toBe("https://example.com/overlay.png");
  });

  it("should support blend preservation modes", () => {
    const overlay1: Pick<QROverlayOptions, "blendPreservationMode"> = {
      blendPreservationMode: "overlay",
    };
    const overlay2: Pick<QROverlayOptions, "blendPreservationMode"> = {
      blendPreservationMode: "dither",
    };

    expect(overlay1.blendPreservationMode).toBe("overlay");
    expect(overlay2.blendPreservationMode).toBe("dither");
  });

  it("should support color dither modes", () => {
    const modes: Array<QROverlayOptions["colorDither"]> = ["none", "per_channel", "perceptual"];
    expect(modes).toHaveLength(3);
  });

  it("should support halftone cell types", () => {
    const cells: Array<QROverlayOptions["halftoneCell"]> = ["per_module", "n×n"];
    expect(cells).toHaveLength(2);
  });

  it("should support brightness curves", () => {
    const curves: Array<QROverlayOptions["brightnessCurve"]> = ["linear", "s-curve", "gamma"];
    expect(curves).toHaveLength(3);
  });

  it("should support GIF disposal handling", () => {
    const handling: Array<QROverlayOptions["gifDisposalHandling"]> = ["respect", "simplify"];
    expect(handling).toHaveLength(2);
  });
});
