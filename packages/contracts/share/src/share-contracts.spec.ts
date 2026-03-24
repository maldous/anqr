import { describe, it, expect } from "vitest";
import type { EmbedOptions } from "./embed-options.contract";
import type { ShareConfig } from "./share-config.contract";
import * as indexExports from "./index";

describe("contracts/share", () => {
  describe("EmbedOptions", () => {
    it("accepts an empty options object (all fields optional)", () => {
      const opts: EmbedOptions = {};
      expect(opts.width).toBeUndefined();
    });

    it("accepts all fields populated", () => {
      const opts: EmbedOptions = {
        width: 400,
        height: 400,
        responsive: true,
        showBorder: false,
        includeLink: true,
      };
      expect(opts.responsive).toBe(true);
      expect(opts.showBorder).toBe(false);
    });

    it("accepts non-square dimensions", () => {
      const opts: EmbedOptions = { width: 800, height: 600 };
      expect(opts.width).toBe(800);
      expect(opts.height).toBe(600);
    });
  });

  describe("ShareConfig", () => {
    it("accepts an empty config (all fields optional)", () => {
      const config: ShareConfig = {};
      expect(Object.keys(config)).toHaveLength(0);
    });

    it("accepts core QR encoding options", () => {
      const config: ShareConfig = {
        data: "https://example.com",
        lang: "en",
        ec: "H",
        version: 5,
        size: 400,
        margin: 4,
        encodingMode: "byte",
        maskPattern: 3,
        characterEncoding: "utf8",
        borderModulesExtra: 2,
        quietZoneMinEnforce: true,
      };
      expect(config.data).toBe("https://example.com");
      expect(config.version).toBe(5);
    });

    it("accepts auto mask pattern", () => {
      const config: ShareConfig = { maskPattern: "auto" };
      expect(config.maskPattern).toBe("auto");
    });

    it("accepts numeric mask pattern", () => {
      const config: ShareConfig = { maskPattern: 7 };
      expect(config.maskPattern).toBe(7);
    });

    it("accepts color and styling options", () => {
      const config: ShareConfig = {
        fg: "#1a1a1a",
        bg: "#f0f0f0",
        transparent: true,
        style: "dot",
        finder: "rounded",
        alignmentStyle: "circle",
        timingStyle: "dot",
        moduleGap: 2,
        gapMode: "uniform",
        cornerRadius: 50,
        dotRotation: 45,
        crispEdges: true,
        pixelSnap: "round",
        perModuleColorMode: "palette",
        contrastGuard: true,
        minContrastRatio: 4.5,
      };
      expect(config.fg).toBe("#1a1a1a");
      expect(config.cornerRadius).toBe(50);
    });

    it("accepts gradient configuration", () => {
      const config: ShareConfig = {
        gradientType: "linear",
        gradientAngle: 45,
        gradientStops: [
          { color: "#ff0000", pos: 0 },
          { color: "#0000ff", pos: 1 },
        ],
      };
      expect(config.gradientStops).toHaveLength(2);
    });

    it("accepts eye styling options", () => {
      const config: ShareConfig = {
        eyeOuterStyle: "rounded",
        eyeInnerStyle: "dot",
        eyeScale: 1.2,
      };
      expect(config.eyeScale).toBe(1.2);
    });

    it("accepts frame configuration", () => {
      const config: ShareConfig = {
        frameStyle: "banner_bottom",
        frameText: "Scan me!",
      };
      expect(config.frameStyle).toBe("banner_bottom");
    });

    it("accepts overlay options", () => {
      const config: ShareConfig = {
        mode: "dithered",
        intensity: 80,
        logoSize: 0.3,
        overlayUrl: "https://example.com/logo.png",
        overlayType: "image",
        overlayFramePick: "first",
        fit: "contain",
        rotate: 90,
        flipX: true,
        flipY: false,
      };
      expect(config.mode).toBe("dithered");
      expect(config.intensity).toBe(80);
    });

    it("accepts overlay image adjustment options", () => {
      const config: ShareConfig = {
        brightness: 10,
        contrast: -5,
        gamma: 1.5,
        saturation: 20,
        blur: 2,
        sharpen: 5,
        posterize: 4,
        threshold: 128,
        edge: "sobel",
        invert: true,
        hue: 180,
        colorMode: "grayscale",
      };
      expect(config.gamma).toBe(1.5);
      expect(config.invert).toBe(true);
    });

    it("accepts dithering options", () => {
      const config: ShareConfig = {
        ditherKind: "floyd-steinberg",
        diffusionKernel: "sierra",
        ditherStrength: 80,
        finderDitherStrength: 40,
        blendPreservations: true,
        blendPreservationMode: "overlay",
        ditherSerpentine: true,
        orderedMatrix: "bayer4",
        blueNoiseTileSize: 64,
        blueNoiseSeed: 42,
        colorDither: "rgb",
      };
      expect(config.blendPreservationMode).toBe("overlay");
    });

    it("accepts blendPreservationMode as dither", () => {
      const config: ShareConfig = { blendPreservationMode: "dither" };
      expect(config.blendPreservationMode).toBe("dither");
    });

    it("accepts subpixel rendering options", () => {
      const config: ShareConfig = {
        subpixelMode: true,
        subpixelGrid: 3,
        subpixelGridSize: "3x3",
        subpixelCenterRule: "strict",
        subpixelNeutralColor: "#808080",
        subpixelFinderOverride: "none",
      };
      expect(config.subpixelGrid).toBe(3);
    });

    it("accepts halftone and duotone options", () => {
      const config: ShareConfig = {
        halftoneCell: "hexagonal",
        halftoneDotShape: "round",
        brightnessCurve: "sigmoid",
        duotoneColor1: "#000000",
        duotoneColor2: "#ff6600",
      };
      expect(config.duotoneColor1).toBe("#000000");
    });

    it("accepts crop configuration", () => {
      const config: ShareConfig = {
        cropEnabled: true,
        cropX: 0.1,
        cropY: 0.1,
        cropSize: 0.8,
      };
      expect(config.cropEnabled).toBe(true);
    });

    it("accepts GIF-specific options", () => {
      const config: ShareConfig = {
        gifUseFrameDelays: true,
        gifMaxFps: 30,
        gifDisposalHandling: "restore",
        gifColors: 128,
        gifPaletteSize: 256,
        gifQuantizer: "median-cut",
        gifDither: "floyd-steinberg",
        gifDisposal: "previous",
        gifTransparentColor: "#ffffff",
      };
      expect(config.gifColors).toBe(128);
    });

    it("accepts protection flags", () => {
      const config: ShareConfig = {
        preserveFinders: true,
        preserveTiming: true,
        preserveAlignment: true,
        protectFormatInfo: true,
        protectVersionInfo: true,
        eccAwareEnabled: true,
        eccAwareRiskBudget: 0.5,
        eccAwareWeightMap: "default",
      };
      expect(config.eccAwareRiskBudget).toBe(0.5);
    });

    it("accepts animation options with generator type references", () => {
      const config: ShareConfig = {
        animationPattern: "wave",
        animationTarget: "both",
        animationWaveAxis: "xy",
        animationPattern2: "shimmer",
        animationTarget2: "modules",
        animationWaveAxis2: "x",
        animationFrames: 30,
        animationSpeed: 100,
        animationSeed: 42,
        speed: 200,
        loop: true,
        reverse: false,
        bounce: true,
        startFrame: 0,
        maxFrames: 60,
        frameStep: 2,
        interpolate: "crossfade",
        temporalDither: "blue_noise",
        moduleJitter: 0.5,
        colorCycle: true,
        seed: 123,
        easing: "ease_in_out",
      };
      expect(config.animationTarget).toBe("both");
      expect(config.animationWaveAxis).toBe("xy");
    });

    it("accepts AnimationTarget values from generator contract", () => {
      const targets: Array<ShareConfig["target"]> = ["result", "modules", "both"];
      expect(new Set(targets).size).toBe(3);
    });

    it("accepts AnimationWaveAxis values from generator contract", () => {
      const axes: Array<ShareConfig["waveAxis"]> = ["x", "y", "xy"];
      expect(new Set(axes).size).toBe(3);
    });

    it("accepts output format options", () => {
      const config: ShareConfig = {
        width: 800,
        height: 600,
        format: "svg",
        quality: 0.9,
        jpegQuality: 85,
        webpQuality: 80,
        dpi: 300,
        filename: "my-qr-code",
        includeQuietZone: true,
        bgOverride: "#f5f5f5",
        formatExtra: '{"key":"value"}',
        svgTrueVector: true,
        svgShapePrecision: "high",
        svgEmbedRasterOverlay: false,
      };
      expect(config.format).toBe("svg");
      expect(config.dpi).toBe(300);
    });

    it("accepts safety and lock options", () => {
      const config: ShareConfig = {
        safetyMode: "strict",
        safetyMinModulePx: 3,
        safetyMinQuietZone: 4,
        lockFinders: true,
        lockTiming: true,
        lockAlign: true,
        lockFormat: true,
        lockVersion: true,
      };
      expect(config.safetyMode).toBe("strict");
    });

    it("accepts QA simulation options", () => {
      const config: ShareConfig = {
        qaContrastCheck: true,
        qaSimulateBlur: 2,
        qaSimulateNoise: 5,
        qaSimulateRotation: 10,
        qaShowHeatmap: true,
      };
      expect(config.qaContrastCheck).toBe(true);
    });

    it("accepts auto-optimization flags", () => {
      const config: ShareConfig = {
        autoPickVersion: true,
        autoPickEcc: true,
        autoReduceIntensity: true,
      };
      expect(config.autoPickVersion).toBe(true);
    });

    it("accepts watermark options", () => {
      const config: ShareConfig = {
        watermarkEnabled: true,
        watermarkKind: "text",
        watermarkText: "ANQR",
        watermarkPosition: "center",
        watermarkOpacity: 0.2,
        watermarkBlend: "multiply",
        watermarkImageUrl: "https://example.com/wm.png",
      };
      expect(config.watermarkText).toBe("ANQR");
    });

    it("accepts metadata options", () => {
      const config: ShareConfig = {
        metaTitle: "My QR Code",
        metaAuthor: "ANQR",
        metaCopyright: "2026",
        metaDescription: "Generated QR code",
        metaLicense: "MIT",
        metaCreationTime: true,
        metaCustomKv: '{"project":"demo"}',
      };
      expect(config.metaTitle).toBe("My QR Code");
    });

    it("accepts overlay intensity per-ECC-level overrides", () => {
      const config: ShareConfig = {
        maxOverlayIntensityL: 0.3,
        maxOverlayIntensityM: 0.5,
        maxOverlayIntensityQ: 0.7,
        maxOverlayIntensityH: 0.9,
      };
      expect(config.maxOverlayIntensityH).toBe(0.9);
    });

    it("accepts palette options", () => {
      const config: ShareConfig = {
        palette: "#ff0000,#00ff00,#0000ff",
        paletteMode: "closest",
      };
      expect(config.palette).toBe("#ff0000,#00ff00,#0000ff");
    });

    it("accepts modulePx parameter", () => {
      const config: ShareConfig = { modulePx: 10 };
      expect(config.modulePx).toBe(10);
    });
  });

  describe("cross-contract type usage", () => {
    it("target field uses AnimationTarget from generator contracts", () => {
      const targets: Array<ShareConfig["target"]> = ["result", "modules", "both", undefined];
      const defined = targets.filter((t): t is NonNullable<typeof t> => t !== undefined);
      expect(new Set(defined).size).toBe(3);
    });

    it("waveAxis field uses AnimationWaveAxis from generator contracts", () => {
      const axes: Array<ShareConfig["waveAxis"]> = ["x", "y", "xy", undefined];
      const defined = axes.filter((a): a is NonNullable<typeof a> => a !== undefined);
      expect(new Set(defined).size).toBe(3);
    });

    it("animationTarget and target both accept AnimationTarget values", () => {
      const config1: ShareConfig = { target: "both" };
      const config2: ShareConfig = { animationTarget: "both" };
      expect(config1.target).toBe(config2.animationTarget);
    });

    it("animationWaveAxis and waveAxis both accept AnimationWaveAxis values", () => {
      const config1: ShareConfig = { waveAxis: "xy" };
      const config2: ShareConfig = { animationWaveAxis: "xy" };
      expect(config1.waveAxis).toBe(config2.animationWaveAxis);
    });
  });

  describe("structural field counts (drift detection)", () => {
    it("EmbedOptions has exactly 5 optional fields", () => {
      const full: EmbedOptions = {
        width: 400,
        height: 400,
        responsive: true,
        showBorder: false,
        includeLink: true,
      };
      expect(Object.keys(full)).toHaveLength(5);
    });

    it("ShareConfig blendPreservationMode is strictly 'overlay' | 'dither'", () => {
      const modes: Array<ShareConfig["blendPreservationMode"]> = ["overlay", "dither", undefined];
      const defined = modes.filter((m): m is NonNullable<typeof m> => m !== undefined);
      expect(new Set(defined).size).toBe(2);
    });

    it("ShareConfig maskPattern accepts both string and number", () => {
      const auto: ShareConfig = { maskPattern: "auto" };
      const numeric: ShareConfig = { maskPattern: 5 };
      expect(auto.maskPattern).toBe("auto");
      expect(numeric.maskPattern).toBe(5);
    });
  });

  describe("index re-exports", () => {
    it("exports only types (no runtime values)", () => {
      expect(Object.keys(indexExports)).toEqual([]);
    });
  });
});
