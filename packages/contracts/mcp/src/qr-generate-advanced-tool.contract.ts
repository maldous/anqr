import { z } from "zod";
export type { QrGenerateAdvancedInput } from "./qr-generate-advanced-input.contract";

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "Overlay URLs must use https");

export const qrGenerateAdvancedInputSchema = {
  data: z.string().min(1).max(4096).describe("Content to encode into the QR code"),
  size: z.number().int().min(50).max(4096).optional().describe("Square output size in pixels"),
  width: z.number().int().min(50).max(4096).optional().describe("Explicit output width in pixels"),
  height: z
    .number()
    .int()
    .min(50)
    .max(4096)
    .optional()
    .describe("Explicit output height in pixels"),
  errorCorrection: z.enum(["L", "M", "Q", "H"]).optional().describe("Error correction level"),
  foreground: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Foreground color as a 6-digit hex value"),
  background: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Background color as a 6-digit hex value"),
  format: z.enum(["png", "svg", "webp", "gif"]).optional().describe("Output format"),
  margin: z.number().int().min(0).max(20).optional().describe("Quiet-zone margin in modules"),
  transparent: z
    .boolean()
    .optional()
    .describe("Render with a transparent background when supported"),
  encodingMode: z.string().optional().describe("Preferred QR encoding mode"),
  version: z
    .number()
    .int()
    .min(0)
    .max(40)
    .optional()
    .describe("Explicit QR version, or 0 for auto"),
  maskPattern: z
    .union([z.literal("auto"), z.number().int().min(0).max(7)])
    .optional()
    .describe("Mask pattern index or auto selection"),
  characterEncoding: z
    .enum(["default", "utf8", "shift-jis"])
    .optional()
    .describe("Character encoding hint"),
  borderModulesExtra: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .describe("Extra border modules beyond the quiet zone"),
  quietZoneMinEnforce: z.boolean().optional().describe("Force minimum quiet-zone enforcement"),
  crispEdges: z.boolean().optional().describe("Favor crisp edge rendering"),
  pixelSnap: z.string().optional().describe("Pixel-snapping strategy"),
  perModuleColorMode: z.string().optional().describe("Per-module color strategy"),
  contrastGuard: z.boolean().optional().describe("Enable contrast guardrails"),
  minContrastRatio: z.number().min(1).max(21).optional().describe("Minimum contrast ratio target"),
  renderSeed: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Deterministic seed for randomized rendering choices"),
  modulePxParam: z.number().int().min(1).max(512).optional().describe("Module pixel size override"),
  moduleStyle: z.enum(["square", "dot", "rounded"]).optional().describe("Primary module style"),
  finderStyle: z.enum(["square", "dot", "rounded"]).optional().describe("Finder pattern style"),
  eyeOuterStyle: z.string().optional().describe("Outer eye styling mode"),
  eyeInnerStyle: z.string().optional().describe("Inner eye styling mode"),
  eyeScale: z.number().min(0.5).max(1.5).optional().describe("Scale factor for eye rendering"),
  cornerRadius: z.number().min(0).max(100).optional().describe("Rounded corner radius percentage"),
  moduleGap: z.number().min(0).max(50).optional().describe("Gap between rendered modules"),
  gapMode: z.string().optional().describe("Gap application mode"),
  dotRotationDeg: z.number().min(-360).max(360).optional().describe("Dot rotation in degrees"),
  frameStyle: z
    .enum(["none", "banner_bottom", "banner_top", "border"])
    .optional()
    .describe("Decorative outer frame style"),
  frameText: z.string().max(120).optional().describe("Text content rendered in a decorative frame"),
  gradientType: z
    .enum(["none", "linear", "radial", "conic"])
    .optional()
    .describe("Gradient fill type"),
  gradientAngle: z.number().min(0).max(360).optional().describe("Gradient angle in degrees"),
  gradientStops: z
    .array(
      z
        .object({
          pos: z.number().min(0).max(1).describe("Normalized stop position from 0 to 1"),
          color: z
            .string()
            .regex(/^#?[0-9a-fA-F]{6}$/)
            .describe("Stop color as a 6-digit hex value"),
        })
        .describe("Single gradient stop"),
    )
    .max(8)
    .optional()
    .describe("Gradient stop list"),
  alignmentStyle: z.string().optional().describe("Alignment pattern styling mode"),
  timingStyle: z.string().optional().describe("Timing pattern styling mode"),
  palette: z
    .array(
      z
        .string()
        .regex(/^#?[0-9a-fA-F]{6}$/)
        .describe("Palette color as a 6-digit hex value"),
    )
    .max(16)
    .optional()
    .describe("Palette colors used by palette-based styling modes"),
  paletteMode: z.string().optional().describe("Palette application mode"),
  preserveFinders: z.boolean().optional().describe("Preserve finder patterns from heavy styling"),
  preserveTiming: z.boolean().optional().describe("Preserve timing patterns from heavy styling"),
  preserveAlignment: z
    .boolean()
    .optional()
    .describe("Preserve alignment patterns from heavy styling"),
  protectFormatInfo: z.boolean().optional().describe("Protect format information modules"),
  protectVersionInfo: z.boolean().optional().describe("Protect version information modules"),
  eccAwareEnabled: z
    .boolean()
    .optional()
    .describe("Enable ECC-aware overlay and styling constraints"),
  eccAwareRiskBudget: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("ECC-aware risk budget from 0 to 1"),
  eccAwareWeightMap: z.string().optional().describe("ECC-aware weighting preset or serialized map"),
  overlayUrl: httpsUrlSchema.optional().describe("HTTPS overlay image URL only"),
  overlayMode: z
    .enum(["dithered", "fill", "fit", "center", "subpixel"])
    .optional()
    .describe("Overlay compositing mode"),
  overlayIntensity: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .describe("Overlay strength as a percentage"),
  colorMode: z.string().optional().describe("Overlay color-processing mode"),
  logoSize: z.number().min(0).max(1).optional().describe("Relative overlay logo size from 0 to 1"),
  overlayBrightness: z
    .number()
    .int()
    .min(-100)
    .max(100)
    .optional()
    .describe("Overlay brightness adjustment"),
  overlayContrast: z
    .number()
    .int()
    .min(-100)
    .max(100)
    .optional()
    .describe("Overlay contrast adjustment"),
  overlayGamma: z.number().min(0.1).max(3).optional().describe("Overlay gamma adjustment"),
  overlaySaturation: z
    .number()
    .int()
    .min(-100)
    .max(100)
    .optional()
    .describe("Overlay saturation adjustment"),
  overlayHueRotate: z
    .number()
    .int()
    .min(-360)
    .max(360)
    .optional()
    .describe("Overlay hue rotation in degrees"),
  overlayInvert: z.boolean().optional().describe("Invert overlay colors"),
  overlayBlur: z.number().int().min(0).max(100).optional().describe("Overlay blur intensity"),
  overlaySharpen: z.number().int().min(0).max(100).optional().describe("Overlay sharpen intensity"),
  overlayPosterize: z.number().int().min(0).max(255).optional().describe("Overlay posterize level"),
  overlayThreshold: z.number().int().min(0).max(255).optional().describe("Overlay threshold level"),
  overlayEdgeDetect: z
    .enum(["off", "sobel", "canny"])
    .optional()
    .describe("Overlay edge-detection mode"),
  overlayFit: z.enum(["contain", "cover", "fill"]).optional().describe("Overlay fit strategy"),
  overlayRotate: z
    .number()
    .int()
    .min(-360)
    .max(360)
    .optional()
    .describe("Overlay rotation in degrees"),
  overlayFlipX: z.boolean().optional().describe("Flip overlay horizontally"),
  overlayFlipY: z.boolean().optional().describe("Flip overlay vertically"),
  ditherKind: z.string().optional().describe("Dithering algorithm family"),
  diffusionKernel: z.string().optional().describe("Diffusion kernel preset"),
  ditherStrength: z.number().int().min(0).max(100).optional().describe("Overall dither intensity"),
  finderDitherStrength: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .describe("Finder-specific dither intensity"),
  blendPreservations: z.boolean().optional().describe("Preserve blends during dithering"),
  blendPreservationMode: z.string().optional().describe("Blend-preservation mode"),
  ditherSerpentine: z.boolean().optional().describe("Use serpentine diffusion"),
  orderedMatrix: z.string().optional().describe("Ordered-dither matrix preset"),
  blueNoiseTileSize: z.number().int().min(1).max(512).optional().describe("Blue-noise tile size"),
  blueNoiseSeed: z.number().int().min(0).optional().describe("Blue-noise random seed"),
  colorDither: z.string().optional().describe("Color dither mode"),
  subpixelGridSize: z.string().optional().describe("Subpixel grid-size preset"),
  subpixelGridNum: z
    .number()
    .int()
    .min(1)
    .max(16)
    .optional()
    .describe("Subpixel grid numeric override"),
  subpixelCenterRule: z.string().optional().describe("Subpixel centering rule"),
  subpixelNeutralColor: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Neutral color used for subpixel rendering"),
  subpixelFinderOverride: z
    .string()
    .optional()
    .describe("Finder override mode for subpixel rendering"),
  halftoneCell: z.string().optional().describe("Halftone cell preset"),
  halftoneDotShape: z.string().optional().describe("Halftone dot shape"),
  brightnessCurve: z.string().optional().describe("Brightness curve preset"),
  duotoneColor1: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Primary duotone color"),
  duotoneColor2: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Secondary duotone color"),
  maxOverlayIntensityL: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Maximum overlay intensity allowed at ECC level L"),
  maxOverlayIntensityM: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Maximum overlay intensity allowed at ECC level M"),
  maxOverlayIntensityQ: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Maximum overlay intensity allowed at ECC level Q"),
  maxOverlayIntensityH: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Maximum overlay intensity allowed at ECC level H"),
  outputQuality: z.number().min(0).max(1).optional().describe("Raster encoder quality from 0 to 1"),
  outputDpi: z.number().int().min(1).max(1200).optional().describe("Output DPI metadata"),
  watermarkEnabled: z.boolean().optional().describe("Enable watermark rendering"),
  watermarkKind: z.enum(["text", "image", "pattern"]).optional().describe("Watermark type"),
  watermarkText: z.string().max(120).optional().describe("Watermark text content"),
  watermarkImageUrl: httpsUrlSchema.optional().describe("HTTPS watermark image URL"),
  watermarkPosition: z
    .enum(["center", "corners", "edges", "behind", "quiet_zone"])
    .optional()
    .describe("Watermark placement"),
  watermarkOpacity: z.number().min(0).max(1).optional().describe("Watermark opacity from 0 to 1"),
  watermarkBlend: z
    .enum(["normal", "multiply", "screen", "overlay", "soft-light"])
    .optional()
    .describe("Watermark blend mode"),
  metaTitle: z.string().max(200).optional().describe("Embedded output title metadata"),
  metaAuthor: z.string().max(200).optional().describe("Embedded output author metadata"),
  metaCopyright: z.string().max(200).optional().describe("Embedded output copyright metadata"),
  metaDescription: z.string().max(500).optional().describe("Embedded output description metadata"),
  metaLicense: z.string().max(200).optional().describe("Embedded output license metadata"),
  metaCreationTime: z.boolean().optional().describe("Include creation-time metadata"),
  metaCustomKv: z
    .string()
    .max(1000)
    .optional()
    .describe("Serialized custom metadata key-value pairs"),
  cropEnabled: z.boolean().optional().describe("Enable overlay crop window"),
  cropX: z.number().min(0).max(1).optional().describe("Normalized crop X origin"),
  cropY: z.number().min(0).max(1).optional().describe("Normalized crop Y origin"),
  cropSize: z.number().min(0).max(1).optional().describe("Normalized crop size"),
  overlayType: z.string().optional().describe("Overlay source type hint"),
  overlayFramePick: z.string().optional().describe("Overlay frame-selection strategy"),
  gifUseFrameDelays: z.boolean().optional().describe("Use source GIF frame delays when present"),
  gifDisposalHandling: z.string().optional().describe("GIF disposal handling strategy"),
  gifMaxFps: z.number().int().min(0).max(120).optional().describe("Maximum GIF output frame rate"),
  lockFinders: z.boolean().optional().describe("Lock finder patterns during styling"),
  lockTiming: z.boolean().optional().describe("Lock timing patterns during styling"),
  lockAlign: z.boolean().optional().describe("Lock alignment patterns during styling"),
  lockFormat: z.boolean().optional().describe("Lock format information during styling"),
  lockVersion: z.boolean().optional().describe("Lock version information during styling"),
  safetyMode: z.string().optional().describe("Safety-policy preset"),
  safetyMinModulePx: z
    .number()
    .int()
    .min(1)
    .max(64)
    .optional()
    .describe("Minimum module size required by safety policy"),
  safetyMinQuietZone: z
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Minimum quiet zone required by safety policy"),
  autoPickVersion: z.boolean().optional().describe("Allow the renderer to auto-pick QR version"),
  autoPickEcc: z.boolean().optional().describe("Allow the renderer to auto-pick ECC level"),
  autoReduceIntensity: z
    .boolean()
    .optional()
    .describe("Allow the renderer to auto-reduce overlay intensity"),
  animationPattern: z
    .enum(["none", "pulse", "wave", "scanline", "shimmer", "drift", "color_cycle"])
    .optional()
    .describe("Primary animation pattern"),
  animationPattern2: z
    .enum(["none", "pulse", "wave", "scanline", "shimmer", "drift", "color_cycle"])
    .optional()
    .describe("Secondary animation pattern"),
  animationFrames: z.number().int().min(1).max(60).optional().describe("Animation frame count"),
  animationSpeed: z
    .number()
    .int()
    .min(10)
    .max(1000)
    .optional()
    .describe("Animation speed in milliseconds"),
  animationLoop: z.boolean().optional().describe("Loop the animation"),
  animationBounce: z.boolean().optional().describe("Bounce the primary animation"),
  animationReverse: z.boolean().optional().describe("Reverse the primary animation"),
  animationColorCycle: z.boolean().optional().describe("Enable primary animation color cycling"),
  animationTarget: z
    .enum(["result", "modules", "both"])
    .optional()
    .describe("Primary animation target"),
  animationWaveAxis: z.enum(["x", "y", "xy"]).optional().describe("Primary wave animation axis"),
  animationBounce2: z.boolean().optional().describe("Bounce the secondary animation"),
  animationReverse2: z.boolean().optional().describe("Reverse the secondary animation"),
  animationColorCycle2: z.boolean().optional().describe("Enable secondary animation color cycling"),
  animationTarget2: z
    .enum(["result", "modules", "both"])
    .optional()
    .describe("Secondary animation target"),
  animationWaveAxis2: z.enum(["x", "y", "xy"]).optional().describe("Secondary wave animation axis"),
  animationInterpolate: z
    .enum(["none", "crossfade", "morph"])
    .optional()
    .describe("Frame interpolation mode"),
  animationTemporalDither: z
    .enum(["off", "blue_noise", "flicker_safe"])
    .optional()
    .describe("Temporal dithering mode"),
  animationModuleJitter: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .describe("Per-frame module jitter amount"),
  animationSeed: z.number().int().min(0).optional().describe("Primary animation seed"),
  animationSeed2: z.number().int().min(0).optional().describe("Secondary animation seed"),
  animationEasing: z
    .enum(["linear", "ease_in", "ease_out", "ease_in_out", "bounce"])
    .optional()
    .describe("Primary animation easing"),
  animationEasing2: z
    .enum(["linear", "ease_in", "ease_out", "ease_in_out", "bounce"])
    .optional()
    .describe("Secondary animation easing"),
  animationStartFrame: z.number().int().min(0).optional().describe("Starting frame index"),
  animationMaxFrames: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Maximum number of frames to render"),
  animationFrameStep: z.number().int().min(1).optional().describe("Frame step interval"),
  webpQuality: z.number().int().min(0).max(100).optional().describe("WebP quality percentage"),
  gifColors: z.number().int().min(2).max(256).optional().describe("GIF palette size"),
  bgOverride: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Background override color"),
  formatExtra: z.string().optional().describe("Format-specific extra option payload"),
  filename: z.string().max(200).optional().describe("Preferred output filename"),
  includeQuietZone: z.boolean().optional().describe("Include quiet zone in output bounds"),
  gifDisposalCode: z.number().int().min(0).max(3).optional().describe("Explicit GIF disposal code"),
  svgShapePrecision: z.string().optional().describe("SVG shape precision preset"),
  svgEmbedRasterOverlay: z
    .boolean()
    .optional()
    .describe("Embed raster overlay data inside SVG output"),
};
