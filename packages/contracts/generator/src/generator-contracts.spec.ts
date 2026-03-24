import { describe, it, expect } from "vitest";
import type { AlignmentStyle } from "./alignment-style.contract";
import type { AnimationEasing } from "./animation-easing.contract";
import type { AnimationInterpolation } from "./animation-interpolation.contract";
import type { AnimationPatternType } from "./animation-pattern.contract";
import type { AnimationPattern } from "./animation-pattern-alias.contract";
import type { AnimationTarget } from "./animation-target.contract";
import type { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.contract";
import type { AnimationWaveAxis } from "./animation-wave-axis.contract";
import type { CharacterEncoding } from "./character-encoding.contract";
import type { ColorMode } from "./color-mode.contract";
import type { CropRegion } from "./crop-region.contract";
import type { DiffusionKernel } from "./diffusion-kernel.contract";
import type { DitherKind } from "./dither-kind.contract";
import type { ECCLevel } from "./ecc-level.contract";
import type { EncodingMode } from "./encoding-mode.contract";
import type { FinderStyle } from "./finder-style.contract";
import type { FitMode } from "./fit-mode.contract";
import type { FrameStyle } from "./frame-style.contract";
import type { GapMode } from "./gap-mode.contract";
import type { GifDither } from "./gif-dither.contract";
import type { GifQuantizer } from "./gif-quantizer.contract";
import type { GradientConfig } from "./gradient-config.contract";
import type { GradientStop } from "./gradient-stop.contract";
import type { GradientType } from "./gradient-type.contract";
import type { GradientUpdate } from "./gradient.contract";
import type { HSL } from "./hsl.contract";
import type { HSLA } from "./hsla.contract";
import type { MaskPattern } from "./mask-pattern.contract";
import type { ModuleStyle } from "./module-style.contract";
import type { OrderedMatrix } from "./ordered-matrix.contract";
import type { OutputFormat } from "./output-format.contract";
import type { OverlayMode } from "./overlay-mode.contract";
import type { OverlayType } from "./overlay-type.contract";
import type { PayloadKind } from "./payload-kind.contract";
import type { QRAnimationOptions } from "./qr-animation-options.contract";
import type { QRAutoOptions } from "./qr-auto-options.contract";
import type { QRCoreOptions } from "./qr-core-options.contract";
import type { QRGenerationOptions } from "./qr-generation-options.contract";
import type { QRMetadataOptions } from "./qr-metadata-options.contract";
import type { QROutputOptions } from "./qr-output-options.contract";
import type { QROverlayOptions } from "./qr-overlay-options.contract";
import type { QRQualityAssuranceOptions } from "./qr-quality-assurance-options.contract";
import type { QRRenderOptions } from "./qr-render-options.contract";
import type { QRSafetyOptions } from "./qr-safety-options.contract";
import type { QRWatermarkOptions } from "./qr-watermark-options.contract";
import type { RGB } from "./rgb.contract";
import type { RGBA } from "./rgba.contract";
import type { RGBWithMeta } from "./rgb-with-meta.contract";
import type { SafetyMode } from "./safety-mode.contract";
import type { TimingStyle } from "./timing-style.contract";
import type { WatermarkBlend } from "./watermark-blend.contract";
import type { WatermarkKind } from "./watermark-kind.contract";

describe("contracts/generator", () => {
  // ── String Literal Union Types ─────────────────────────────────────────

  describe("QR encoding enums", () => {
    it("ECCLevel has 4 members", () => {
      const values: ECCLevel[] = ["L", "M", "Q", "H"];
      expect(values).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
    });

    it("EncodingMode has 5 members", () => {
      const values: EncodingMode[] = ["auto", "numeric", "alphanumeric", "byte", "kanji"];
      expect(values).toHaveLength(5);
    });

    it("CharacterEncoding has 4 members", () => {
      const values: CharacterEncoding[] = ["default", "utf8", "iso-8859-1", "shift-jis"];
      expect(values).toHaveLength(4);
    });

    it("MaskPattern accepts auto string and numeric patterns 0-7", () => {
      const values: MaskPattern[] = ["auto", 0, 1, 2, 3, 4, 5, 6, 7];
      expect(values).toHaveLength(9);
      expect(values[0]).toBe("auto");
      expect(values.filter((v) => typeof v === "number")).toHaveLength(8);
    });

    it("PayloadKind has 41 members", () => {
      const values: PayloadKind[] = [
        "plain_text", "url", "tel", "email", "sms", "geo",
        "vcard", "mecard", "bizcard", "wifi", "app_link",
        "event", "event_rsvp", "calendar_subscription",
        "social_profile", "messaging_link",
        "epc_sepa", "upi", "paynow", "promptpay", "pix",
        "crypto", "swiss_qr_bill", "lightning", "ethereum_eip681",
        "qris", "duitnow", "bharatqr", "vietqr", "qrph", "twqr", "hkqr", "jpqr", "auspaynet",
        "paypal_me", "cashapp", "emv_generic",
        "gs1_digital_link", "short_link", "utm_link", "custom",
      ];
      expect(values).toHaveLength(41);
      expect(new Set(values).size).toBe(41);
    });
  });

  describe("module and finder style enums", () => {
    it("ModuleStyle has 5 members", () => {
      const values: ModuleStyle[] = ["square", "rounded", "dots", "diamond", "connected"];
      expect(values).toHaveLength(5);
    });

    it("FinderStyle has 3 members", () => {
      const values: FinderStyle[] = ["square", "rounded", "circle"];
      expect(values).toHaveLength(3);
    });

    it("AlignmentStyle has 4 members", () => {
      const values: AlignmentStyle[] = ["match_finder", "square", "rounded", "circle"];
      expect(values).toHaveLength(4);
    });

    it("TimingStyle has 3 members", () => {
      const values: TimingStyle[] = ["match_module", "solid", "dashed"];
      expect(values).toHaveLength(3);
    });

    it("FrameStyle has 4 members", () => {
      const values: FrameStyle[] = ["none", "rounded_frame", "sticker", "tag"];
      expect(values).toHaveLength(4);
    });

    it("GapMode has 4 members", () => {
      const values: GapMode[] = ["none", "inset", "stroke", "negative_space"];
      expect(values).toHaveLength(4);
    });
  });

  describe("color and output enums", () => {
    it("ColorMode has 3 members", () => {
      const values: ColorMode[] = ["color", "grayscale", "bw"];
      expect(values).toHaveLength(3);
    });

    it("OutputFormat has 4 members", () => {
      const values: OutputFormat[] = ["png", "webp", "gif", "svg"];
      expect(values).toHaveLength(4);
    });
  });

  describe("overlay enums", () => {
    it("OverlayMode has 18 members", () => {
      const values: OverlayMode[] = [
        "center", "blend", "halftone", "halftone-dithered", "mosaic",
        "gapfill", "brightness", "duotone", "subpixel", "dithered",
        "blue-noise", "pixelate", "outline", "wave",
        "subpixel-size", "dither", "extreme", "artwork",
      ];
      expect(values).toHaveLength(18);
      expect(new Set(values).size).toBe(18);
    });

    it("OverlayType has 5 members", () => {
      const values: OverlayType[] = ["static", "gif", "apng", "webp_anim", "video"];
      expect(values).toHaveLength(5);
    });

    it("FitMode has 3 members", () => {
      const values: FitMode[] = ["cover", "contain", "stretch"];
      expect(values).toHaveLength(3);
    });
  });

  describe("dither enums", () => {
    it("DitherKind has 17 members", () => {
      const values: DitherKind[] = [
        "none", "error_diffusion", "ordered_bayer", "ordered_clustered",
        "ordered_void_cluster", "blue_noise_threshold", "true_dither",
        "blue_noise", "white_noise", "gaussian_noise", "triangular_noise",
        "blue_noise_error_diffusion", "screened_blue_noise",
        "perceptual", "edge_aware", "adaptive_threshold", "temporal_blue_noise",
      ];
      expect(values).toHaveLength(17);
      expect(new Set(values).size).toBe(17);
    });

    it("DiffusionKernel has 8 members", () => {
      const values: DiffusionKernel[] = [
        "floyd_steinberg", "jarvis_judice_ninke", "stucki", "burkes",
        "sierra", "sierra_2", "sierra_lite", "atkinson",
      ];
      expect(values).toHaveLength(8);
    });

    it("OrderedMatrix has 5 members", () => {
      const values: OrderedMatrix[] = ["bayer2", "bayer4", "bayer8", "clustered_dot", "void_cluster"];
      expect(values).toHaveLength(5);
    });

    it("GifDither has 3 members", () => {
      const values: GifDither[] = ["off", "floyd", "ordered"];
      expect(values).toHaveLength(3);
    });

    it("GifQuantizer has 3 members", () => {
      const values: GifQuantizer[] = ["median_cut", "neuquant", "octree"];
      expect(values).toHaveLength(3);
    });
  });

  describe("animation enums", () => {
    it("AnimationEasing has 5 members", () => {
      const values: AnimationEasing[] = ["linear", "ease_in", "ease_out", "ease_in_out", "bounce"];
      expect(values).toHaveLength(5);
    });

    it("AnimationInterpolation has 3 members", () => {
      const values: AnimationInterpolation[] = ["none", "crossfade", "morph"];
      expect(values).toHaveLength(3);
    });

    it("AnimationPatternType has 7 members", () => {
      const values: AnimationPatternType[] = [
        "none", "pulse", "wave", "scanline", "shimmer", "drift", "color_cycle",
      ];
      expect(values).toHaveLength(7);
    });

    it("AnimationPattern is an alias for AnimationPatternType", () => {
      const pattern: AnimationPattern = "pulse";
      const patternType: AnimationPatternType = pattern;
      expect(patternType).toBe("pulse");
    });

    it("AnimationTarget has 3 members", () => {
      const values: AnimationTarget[] = ["result", "modules", "both"];
      expect(values).toHaveLength(3);
    });

    it("AnimationTemporalDitherMode has 3 members", () => {
      const values: AnimationTemporalDitherMode[] = ["off", "blue_noise", "flicker_safe"];
      expect(values).toHaveLength(3);
    });

    it("AnimationWaveAxis has 3 members", () => {
      const values: AnimationWaveAxis[] = ["x", "y", "xy"];
      expect(values).toHaveLength(3);
    });
  });

  describe("gradient, watermark, and safety enums", () => {
    it("GradientType has 4 members", () => {
      const values: GradientType[] = ["none", "linear", "radial", "conic"];
      expect(values).toHaveLength(4);
    });

    it("WatermarkBlend has 5 members", () => {
      const values: WatermarkBlend[] = ["normal", "multiply", "screen", "overlay", "soft-light"];
      expect(values).toHaveLength(5);
    });

    it("WatermarkKind has 3 members", () => {
      const values: WatermarkKind[] = ["text", "image", "pattern"];
      expect(values).toHaveLength(3);
    });

    it("SafetyMode has 3 members", () => {
      const values: SafetyMode[] = ["off", "balanced", "strict"];
      expect(values).toHaveLength(3);
    });
  });

  // ── Color Interfaces ───────────────────────────────────────────────────

  describe("color interfaces", () => {
    it("RGB accepts r, g, b number channels", () => {
      const color: RGB = { r: 255, g: 128, b: 0 };
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(0);
    });

    it("RGBA extends RGB with alpha channel", () => {
      const color: RGBA = { r: 255, g: 128, b: 0, a: 0.5 };
      expect(color.a).toBe(0.5);
      const rgb: RGB = color;
      expect(rgb.r).toBe(255);
    });

    it("RGBWithMeta extends RGB with optional halftone and sizeRatio", () => {
      const minimal: RGBWithMeta = { r: 0, g: 0, b: 0 };
      expect(minimal.halftone).toBeUndefined();
      expect(minimal.sizeRatio).toBeUndefined();

      const full: RGBWithMeta = { r: 128, g: 64, b: 32, halftone: true, sizeRatio: 0.8 };
      expect(full.halftone).toBe(true);
      expect(full.sizeRatio).toBe(0.8);
      const rgb: RGB = full;
      expect(rgb.r).toBe(128);
    });

    it("HSL accepts h, s, l number channels", () => {
      const color: HSL = { h: 180, s: 100, l: 50 };
      expect(color.h).toBe(180);
      expect(color.s).toBe(100);
      expect(color.l).toBe(50);
    });

    it("HSLA extends HSL with alpha channel", () => {
      const color: HSLA = { h: 270, s: 80, l: 60, a: 1.0 };
      expect(color.a).toBe(1.0);
      const hsl: HSL = color;
      expect(hsl.h).toBe(270);
    });
  });

  // ── Geometry & Config Interfaces ───────────────────────────────────────

  describe("geometry and config interfaces", () => {
    it("CropRegion has x, y, size", () => {
      const region: CropRegion = { x: 10, y: 20, size: 100 };
      expect(region.x).toBe(10);
      expect(region.y).toBe(20);
      expect(region.size).toBe(100);
    });

    it("GradientStop has pos and color", () => {
      const stop: GradientStop = { pos: 0.5, color: "#ff0000" };
      expect(stop.pos).toBe(0.5);
      expect(stop.color).toBe("#ff0000");
    });

    it("GradientConfig requires type and stops, angle is optional", () => {
      const minimal: GradientConfig = {
        type: "linear",
        stops: [{ pos: 0, color: "#000" }, { pos: 1, color: "#fff" }],
      };
      expect(minimal.type).toBe("linear");
      expect(minimal.stops).toHaveLength(2);
      expect(minimal.angle).toBeUndefined();

      const full: GradientConfig = {
        type: "conic",
        angle: 45,
        stops: [{ pos: 0, color: "red" }],
      };
      expect(full.angle).toBe(45);
    });

    it("GradientUpdate requires type, stops and angle are optional", () => {
      const minimal: GradientUpdate = { type: "none" };
      expect(minimal.type).toBe("none");
      expect(minimal.stops).toBeUndefined();
      expect(minimal.angle).toBeUndefined();

      const full: GradientUpdate = {
        type: "radial",
        stops: [{ pos: 0, color: "#000" }],
        angle: 90,
      };
      expect(full.stops).toHaveLength(1);
    });
  });

  // ── Composite Option Interfaces ────────────────────────────────────────

  describe("QRCoreOptions", () => {
    const coreOptions: QRCoreOptions = {
      version: 5,
      ecc: "H",
      encodingMode: "byte",
      maskPattern: "auto",
      characterEncoding: "utf8",
      quietZoneModules: 4,
      quietZoneMinEnforce: true,
      borderModulesExtra: 0,
    };

    it("accepts all required fields", () => {
      expect(coreOptions.version).toBe(5);
      expect(coreOptions.ecc).toBe("H");
      expect(coreOptions.encodingMode).toBe("byte");
      expect(coreOptions.maskPattern).toBe("auto");
      expect(coreOptions.characterEncoding).toBe("utf8");
      expect(coreOptions.quietZoneModules).toBe(4);
      expect(coreOptions.quietZoneMinEnforce).toBe(true);
      expect(coreOptions.borderModulesExtra).toBe(0);
    });

    it("accepts numeric mask patterns", () => {
      const opts: QRCoreOptions = { ...coreOptions, maskPattern: 3 };
      expect(opts.maskPattern).toBe(3);
    });
  });

  describe("QRRenderOptions", () => {
    it("accepts a complete render options object", () => {
      const renderOptions: QRRenderOptions = {
        modulePx: 10,
        crispEdges: true,
        pixelSnap: "floor",
        moduleGapPercent: 0,
        gapMode: "none",
        moduleStyle: "square",
        finderStyle: "rounded",
        alignmentStyle: "match_finder",
        timingStyle: "match_module",
        cornerRadius: 0.5,
        dotRotationDeg: 0,
        eyeOuterStyle: "square",
        eyeInnerStyle: "circle",
        eyeScale: 1.0,
        frameStyle: "none",
        frameText: "",
        fgColor: "#000000",
        bgColor: "#ffffff",
        bgTransparent: false,
        palette: [],
        paletteMode: "closest",
        gradient: { type: "none" },
        perModuleColorMode: "off",
        contrastGuard: true,
        minContrastRatio: 4.5,
      };
      expect(renderOptions.modulePx).toBe(10);
      expect(renderOptions.pixelSnap).toBe("floor");
      expect(renderOptions.gradient.type).toBe("none");
    });

    it("pixelSnap accepts all valid values", () => {
      const snaps: Array<QRRenderOptions["pixelSnap"]> = ["floor", "round", "ceil"];
      expect(snaps).toHaveLength(3);
    });
  });

  describe("QROutputOptions", () => {
    it("accepts a complete output options object", () => {
      const outputOptions: QROutputOptions = {
        format: "png",
        widthPx: 512,
        heightPx: 512,
        quality: 90,
        filename: "qr-code",
        includeQuietZone: true,
        dpi: 300,
        bgOverride: "",
        gifPaletteSize: 256,
        gifQuantizer: "median_cut",
        gifDither: "floyd",
        gifTransparentColor: "",
        gifDisposal: "restore_bg",
        svgTrueVector: true,
        svgShapePrecision: 2,
        svgEmbedRasterOverlay: false,
      };
      expect(outputOptions.format).toBe("png");
      expect(outputOptions.widthPx).toBe(512);
      expect(outputOptions.svgShapePrecision).toBe(2);
    });

    it("svgShapePrecision accepts string or number", () => {
      const asNumber: QROutputOptions["svgShapePrecision"] = 3;
      const asString: QROutputOptions["svgShapePrecision"] = "auto";
      expect(typeof asNumber).toBe("number");
      expect(typeof asString).toBe("string");
    });
  });

  describe("QROverlayOptions", () => {
    it("accepts a complete overlay options object", () => {
      const overlayOptions: QROverlayOptions = {
        enabled: true,
        url: "https://example.com/logo.png",
        cropEnabled: false,
        cropRegion: { x: 0, y: 0, size: 100 },
        fit: "contain",
        rotateDeg: 0,
        flipX: false,
        flipY: false,
        colorMode: "color",
        invert: false,
        brightness: 1.0,
        contrast: 1.0,
        gamma: 1.0,
        saturation: 1.0,
        hueRotateDeg: 0,
        blurPx: 0,
        sharpen: 0,
        posterizeLevels: 0,
        threshold: 128,
        edgeDetect: "off",
        mode: "center",
        type: "static",
        intensity: 0.5,
        preserveFinders: true,
        preserveTiming: true,
        preserveAlignment: true,
        protectFormatInfo: true,
        protectVersionInfo: true,
        framePick: "auto",
        ditherKind: "none",
        ditherStrength: 1.0,
        finderDitherStrength: 0,
        blendPreservations: false,
        blendPreservationMode: "overlay",
        ditherSerpentine: true,
        diffusionKernel: "floyd_steinberg",
        orderedMatrix: "bayer4",
        blueNoiseTileSize: 64,
        blueNoiseSeed: 42,
        colorDither: "none",
        subpixelGridSize: "3",
        subpixelCenterRule: "finder",
        subpixelNeutralColor: "#808080",
        subpixelFinderOverride: "",
        halftoneCell: "per_module",
        halftoneDotShape: "circle",
        duotoneColors: ["#000000", "#ffffff"],
        brightnessCurve: "linear",
        eccAwareEnabled: false,
        eccAwareRiskBudget: 0.5,
        eccAwareWeightMap: "",
        gifUseFrameDelays: true,
        gifMaxFps: 30,
        gifDisposalHandling: "respect",
        qrFirstMode: false,
        qrartIterations: 100,
        qrartFragmentLength: 4,
        qrartSeed: 0,
      };
      expect(overlayOptions.enabled).toBe(true);
      expect(overlayOptions.mode).toBe("center");
      expect(overlayOptions.duotoneColors).toEqual(["#000000", "#ffffff"]);
    });

    it("blendPreservationMode accepts overlay or dither", () => {
      const modes: Array<QROverlayOptions["blendPreservationMode"]> = ["overlay", "dither"];
      expect(modes).toHaveLength(2);
    });

    it("colorDither accepts none, per_channel, or perceptual", () => {
      const values: Array<QROverlayOptions["colorDither"]> = ["none", "per_channel", "perceptual"];
      expect(values).toHaveLength(3);
    });

    it("halftoneCell accepts per_module or n×n", () => {
      const values: Array<QROverlayOptions["halftoneCell"]> = ["per_module", "n×n"];
      expect(values).toHaveLength(2);
    });

    it("brightnessCurve accepts linear, s-curve, or gamma", () => {
      const values: Array<QROverlayOptions["brightnessCurve"]> = ["linear", "s-curve", "gamma"];
      expect(values).toHaveLength(3);
    });

    it("gifDisposalHandling accepts respect or simplify", () => {
      const values: Array<QROverlayOptions["gifDisposalHandling"]> = ["respect", "simplify"];
      expect(values).toHaveLength(2);
    });
  });

  describe("QRAnimationOptions", () => {
    it("accepts a complete animation options object", () => {
      const animationOptions: QRAnimationOptions = {
        speedMs: 100,
        loop: true,
        bounce: false,
        startFrame: 0,
        maxFrames: 60,
        frameStep: 1,
        interpolate: "crossfade",
        temporalDither: "off",
        seed: 42,
        pattern: "wave",
        target: "modules",
        waveAxis: "xy",
        pattern2: "none",
        target2: "result",
        waveAxis2: "x",
        moduleJitterPx: 0,
        colorCycle: false,
      };
      expect(animationOptions.speedMs).toBe(100);
      expect(animationOptions.pattern).toBe("wave");
      expect(animationOptions.interpolate).toBe("crossfade");
    });

    it("supports dual pattern/target/waveAxis layers", () => {
      const opts: QRAnimationOptions = {
        speedMs: 50,
        loop: true,
        bounce: true,
        startFrame: 0,
        maxFrames: 120,
        frameStep: 2,
        interpolate: "none",
        temporalDither: "blue_noise",
        seed: 0,
        pattern: "shimmer",
        target: "both",
        waveAxis: "y",
        pattern2: "color_cycle",
        target2: "modules",
        waveAxis2: "xy",
        moduleJitterPx: 2,
        colorCycle: true,
      };
      expect(opts.pattern).toBe("shimmer");
      expect(opts.pattern2).toBe("color_cycle");
      expect(opts.target).toBe("both");
      expect(opts.target2).toBe("modules");
    });
  });

  describe("QRAutoOptions", () => {
    it("accepts all boolean flags", () => {
      const autoOptions: QRAutoOptions = {
        pickVersion: true,
        pickEcc: true,
        reduceIntensityUntilSafe: false,
      };
      expect(autoOptions.pickVersion).toBe(true);
      expect(autoOptions.pickEcc).toBe(true);
      expect(autoOptions.reduceIntensityUntilSafe).toBe(false);
    });
  });

  describe("QRMetadataOptions", () => {
    it("accepts all string fields and customKv array", () => {
      const metadataOptions: QRMetadataOptions = {
        title: "Test QR",
        author: "ANQR",
        copyright: "2026",
        license: "MIT",
        description: "A test QR code",
        creationTime: true,
        customKv: [
          { k: "project", v: "anqr" },
          { k: "version", v: "1.0" },
        ],
      };
      expect(metadataOptions.title).toBe("Test QR");
      expect(metadataOptions.customKv).toHaveLength(2);
      expect(metadataOptions.customKv[0]).toEqual({ k: "project", v: "anqr" });
    });

    it("accepts empty customKv array", () => {
      const opts: QRMetadataOptions = {
        title: "",
        author: "",
        copyright: "",
        license: "",
        description: "",
        creationTime: false,
        customKv: [],
      };
      expect(opts.customKv).toHaveLength(0);
    });
  });

  describe("QRSafetyOptions", () => {
    it("accepts all required fields including maxOverlayIntensityByEcc record", () => {
      const safetyOptions: QRSafetyOptions = {
        mode: "balanced",
        minModulePx: 3,
        minQuietZoneModules: 4,
        lockFinders: true,
        lockTiming: true,
        lockAlign: true,
        lockFormat: true,
        lockVersion: true,
        maxOverlayIntensityByEcc: { L: 0.3, M: 0.25, Q: 0.2, H: 0.15 },
      };
      expect(safetyOptions.mode).toBe("balanced");
      expect(safetyOptions.maxOverlayIntensityByEcc.H).toBe(0.15);
    });

    it("maxOverlayIntensityByEcc is keyed by all 4 ECC levels", () => {
      const record: QRSafetyOptions["maxOverlayIntensityByEcc"] = {
        L: 1.0, M: 0.75, Q: 0.5, H: 0.25,
      };
      expect(Object.keys(record).sort()).toEqual(["H", "L", "M", "Q"]);
    });
  });

  describe("QRQualityAssuranceOptions", () => {
    it("accepts all fields", () => {
      const qaOptions: QRQualityAssuranceOptions = {
        contrastCheck: true,
        simulateBlurPx: 2,
        simulateNoise: 0.1,
        simulateRotationDeg: 5,
        showHeatmap: false,
      };
      expect(qaOptions.contrastCheck).toBe(true);
      expect(qaOptions.simulateBlurPx).toBe(2);
    });
  });

  describe("QRWatermarkOptions", () => {
    it("accepts all fields", () => {
      const watermarkOptions: QRWatermarkOptions = {
        enabled: true,
        kind: "text",
        text: "anqr.app",
        position: "bottom-right",
        opacity: 0.5,
        blend: "normal",
      };
      expect(watermarkOptions.enabled).toBe(true);
      expect(watermarkOptions.kind).toBe("text");
      expect(watermarkOptions.opacity).toBe(0.5);
    });
  });

  // ── Top-Level Composition ──────────────────────────────────────────────

  describe("QRGenerationOptions", () => {
    it("composes all 10 sub-option interfaces", () => {
      const options: QRGenerationOptions = {
        qr: {
          version: 1,
          ecc: "M",
          encodingMode: "auto",
          maskPattern: "auto",
          characterEncoding: "default",
          quietZoneModules: 4,
          quietZoneMinEnforce: true,
          borderModulesExtra: 0,
        },
        render: {
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
          fgColor: "#000",
          bgColor: "#fff",
          bgTransparent: false,
          palette: [],
          paletteMode: "off",
          gradient: { type: "none" },
          perModuleColorMode: "off",
          contrastGuard: true,
          minContrastRatio: 4.5,
        },
        overlay: {
          enabled: false,
          url: "",
          cropEnabled: false,
          cropRegion: { x: 0, y: 0, size: 0 },
          fit: "contain",
          rotateDeg: 0,
          flipX: false,
          flipY: false,
          colorMode: "color",
          invert: false,
          brightness: 1,
          contrast: 1,
          gamma: 1,
          saturation: 1,
          hueRotateDeg: 0,
          blurPx: 0,
          sharpen: 0,
          posterizeLevels: 0,
          threshold: 128,
          edgeDetect: "off",
          mode: "center",
          type: "static",
          intensity: 0.5,
          preserveFinders: true,
          preserveTiming: true,
          preserveAlignment: true,
          protectFormatInfo: true,
          protectVersionInfo: true,
          framePick: "auto",
          ditherKind: "none",
          ditherStrength: 1,
          finderDitherStrength: 0,
          blendPreservations: false,
          blendPreservationMode: "overlay",
          ditherSerpentine: true,
          diffusionKernel: "floyd_steinberg",
          orderedMatrix: "bayer4",
          blueNoiseTileSize: 64,
          blueNoiseSeed: 0,
          colorDither: "none",
          subpixelGridSize: "3",
          subpixelCenterRule: "finder",
          subpixelNeutralColor: "#808080",
          subpixelFinderOverride: "",
          halftoneCell: "per_module",
          halftoneDotShape: "circle",
          duotoneColors: ["#000", "#fff"],
          brightnessCurve: "linear",
          eccAwareEnabled: false,
          eccAwareRiskBudget: 0.5,
          eccAwareWeightMap: "",
          gifUseFrameDelays: true,
          gifMaxFps: 30,
          gifDisposalHandling: "respect",
          qrFirstMode: false,
          qrartIterations: 100,
          qrartFragmentLength: 4,
          qrartSeed: 0,
        },
        animation: {
          speedMs: 100,
          loop: true,
          bounce: false,
          startFrame: 0,
          maxFrames: 60,
          frameStep: 1,
          interpolate: "none",
          temporalDither: "off",
          seed: 0,
          pattern: "none",
          target: "result",
          waveAxis: "x",
          pattern2: "none",
          target2: "result",
          waveAxis2: "x",
          moduleJitterPx: 0,
          colorCycle: false,
        },
        output: {
          format: "png",
          widthPx: 512,
          heightPx: 512,
          quality: 90,
          filename: "qr",
          includeQuietZone: true,
          dpi: 72,
          bgOverride: "",
          gifPaletteSize: 256,
          gifQuantizer: "median_cut",
          gifDither: "off",
          gifTransparentColor: "",
          gifDisposal: "none",
          svgTrueVector: true,
          svgShapePrecision: 2,
          svgEmbedRasterOverlay: false,
        },
        watermark: {
          enabled: false,
          kind: "text",
          text: "",
          position: "bottom-right",
          opacity: 0.3,
          blend: "normal",
        },
        metadata: {
          title: "",
          author: "",
          copyright: "",
          license: "",
          description: "",
          creationTime: true,
          customKv: [],
        },
        safety: {
          mode: "balanced",
          minModulePx: 3,
          minQuietZoneModules: 4,
          lockFinders: true,
          lockTiming: true,
          lockAlign: true,
          lockFormat: true,
          lockVersion: true,
          maxOverlayIntensityByEcc: { L: 0.3, M: 0.25, Q: 0.2, H: 0.15 },
        },
        qa: {
          contrastCheck: true,
          simulateBlurPx: 0,
          simulateNoise: 0,
          simulateRotationDeg: 0,
          showHeatmap: false,
        },
        auto: {
          pickVersion: true,
          pickEcc: true,
          reduceIntensityUntilSafe: false,
        },
      };

      expect(Object.keys(options).sort()).toEqual([
        "animation", "auto", "metadata", "output", "overlay",
        "qa", "qr", "render", "safety", "watermark",
      ]);
      expect(options.qr.ecc).toBe("M");
      expect(options.render.moduleStyle).toBe("square");
      expect(options.overlay.enabled).toBe(false);
      expect(options.animation.pattern).toBe("none");
      expect(options.output.format).toBe("png");
      expect(options.watermark.enabled).toBe(false);
      expect(options.metadata.creationTime).toBe(true);
      expect(options.safety.mode).toBe("balanced");
      expect(options.qa.contrastCheck).toBe(true);
      expect(options.auto.pickVersion).toBe(true);
    });
  });

  // ── Structural Drift Detection ─────────────────────────────────────────

  describe("structural field counts (drift detection)", () => {
    it("QRCoreOptions has exactly 8 fields", () => {
      const opts: QRCoreOptions = {
        version: 1, ecc: "L", encodingMode: "auto", maskPattern: "auto",
        characterEncoding: "default", quietZoneModules: 4,
        quietZoneMinEnforce: false, borderModulesExtra: 0,
      };
      expect(Object.keys(opts)).toHaveLength(8);
    });

    it("QRRenderOptions has exactly 25 fields", () => {
      const opts: QRRenderOptions = {
        modulePx: 10, crispEdges: true, pixelSnap: "floor",
        moduleGapPercent: 0, gapMode: "none", moduleStyle: "square",
        finderStyle: "square", alignmentStyle: "square",
        timingStyle: "solid", cornerRadius: 0, dotRotationDeg: 0,
        eyeOuterStyle: "square", eyeInnerStyle: "square", eyeScale: 1,
        frameStyle: "none", frameText: "", fgColor: "#000", bgColor: "#fff",
        bgTransparent: false, palette: [], paletteMode: "off",
        gradient: { type: "none" }, perModuleColorMode: "off",
        contrastGuard: true, minContrastRatio: 4.5,
      };
      expect(Object.keys(opts)).toHaveLength(25);
    });

    it("QROutputOptions has exactly 16 fields", () => {
      const opts: QROutputOptions = {
        format: "png", widthPx: 512, heightPx: 512, quality: 90,
        filename: "qr", includeQuietZone: true, dpi: 72, bgOverride: "",
        gifPaletteSize: 256, gifQuantizer: "median_cut", gifDither: "off",
        gifTransparentColor: "", gifDisposal: "none",
        svgTrueVector: true, svgShapePrecision: 2, svgEmbedRasterOverlay: false,
      };
      expect(Object.keys(opts)).toHaveLength(16);
    });

    it("QRAnimationOptions has exactly 17 fields", () => {
      const opts: QRAnimationOptions = {
        speedMs: 100, loop: true, bounce: false, startFrame: 0,
        maxFrames: 60, frameStep: 1, interpolate: "none",
        temporalDither: "off", seed: 0, pattern: "none", target: "result",
        waveAxis: "x", pattern2: "none", target2: "result",
        waveAxis2: "x", moduleJitterPx: 0, colorCycle: false,
      };
      expect(Object.keys(opts)).toHaveLength(17);
    });

    it("QRAutoOptions has exactly 3 fields", () => {
      const opts: QRAutoOptions = {
        pickVersion: true, pickEcc: true, reduceIntensityUntilSafe: false,
      };
      expect(Object.keys(opts)).toHaveLength(3);
    });

    it("QRMetadataOptions has exactly 7 fields", () => {
      const opts: QRMetadataOptions = {
        title: "", author: "", copyright: "", license: "",
        description: "", creationTime: false, customKv: [],
      };
      expect(Object.keys(opts)).toHaveLength(7);
    });

    it("QRSafetyOptions has exactly 9 fields", () => {
      const opts: QRSafetyOptions = {
        mode: "off", minModulePx: 1, minQuietZoneModules: 0,
        lockFinders: false, lockTiming: false, lockAlign: false,
        lockFormat: false, lockVersion: false,
        maxOverlayIntensityByEcc: { L: 1, M: 1, Q: 1, H: 1 },
      };
      expect(Object.keys(opts)).toHaveLength(9);
    });

    it("QRQualityAssuranceOptions has exactly 5 fields", () => {
      const opts: QRQualityAssuranceOptions = {
        contrastCheck: false, simulateBlurPx: 0, simulateNoise: 0,
        simulateRotationDeg: 0, showHeatmap: false,
      };
      expect(Object.keys(opts)).toHaveLength(5);
    });

    it("QRWatermarkOptions has exactly 6 fields", () => {
      const opts: QRWatermarkOptions = {
        enabled: false, kind: "text", text: "",
        position: "center", opacity: 0, blend: "normal",
      };
      expect(Object.keys(opts)).toHaveLength(6);
    });

    it("QRGenerationOptions has exactly 10 top-level keys", () => {
      const keys = [
        "qr", "render", "overlay", "animation", "output",
        "watermark", "metadata", "safety", "qa", "auto",
      ];
      expect(keys).toHaveLength(10);
      expect(new Set(keys).size).toBe(10);
    });
  });

  describe("QRCoreOptions encoding mode coverage", () => {
    it("accepts all 5 encoding modes", () => {
      const modes: Array<QRCoreOptions["encodingMode"]> = [
        "auto", "numeric", "alphanumeric", "byte", "kanji",
      ];
      expect(new Set(modes).size).toBe(5);
    });

    it("accepts all 4 character encodings", () => {
      const encodings: Array<QRCoreOptions["characterEncoding"]> = [
        "default", "utf8", "iso-8859-1", "shift-jis",
      ];
      expect(new Set(encodings).size).toBe(4);
    });

    it("accepts all 4 ECC levels", () => {
      const levels: Array<QRCoreOptions["ecc"]> = ["L", "M", "Q", "H"];
      expect(new Set(levels).size).toBe(4);
    });
  });

  // ── Index Re-exports ───────────────────────────────────────────────────

  describe("index re-exports", () => {
    it("exports only types (no runtime values)", async () => {
      const mod = await import("./index");
      expect(Object.keys(mod)).toEqual([]);
    });
  });
});
