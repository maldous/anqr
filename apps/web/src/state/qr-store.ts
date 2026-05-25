/**
 * QR Store - Central state management for ANQR
 *
 * Type Alignment with Modules:
 * - Gradient types (GradientStop, GradientType): from @/contracts/generator
 * - Payload types (UrlHelper, VCardHelper, etc.): from @/application/generator
 * - QR encoding types (ECCLevel, EncodingMode): align with the domain QR encode/spec boundary (with UI extensions)
 * - Overlay types (OverlayMode, ColorMode, FitMode): align with the render overlay public/compat surface
 * - Dither types (DitherKind, DiffusionKernel): align with the render dither boundary
 * - Output types (OutputFormat, GifQuantizer): align with the render exporter boundary
 *
 * Note: Some types are defined locally with UI-specific extensions (e.g., 'auto' for MaskPattern)
 * that are not part of the core module types.
 */
import { create } from "zustand";
import { DEFAULT_ANIMATION } from "./qr-store-defaults/default-animation";
import { DEFAULT_METADATA } from "./qr-store-defaults/default-metadata";
import { DEFAULT_OUTPUT } from "./qr-store-defaults/default-output";
import { DEFAULT_OVERLAY } from "./qr-store-defaults/default-overlay";
import { DEFAULT_PAYLOAD } from "./qr-store-defaults/default-payload";
import { DEFAULT_QR } from "./qr-store-defaults/default-qr";
import { DEFAULT_RENDER } from "./qr-store-defaults/default-render";
import { DEFAULT_SAFETY } from "./qr-store-defaults/default-safety";
import { DEFAULT_WATERMARK } from "./qr-store-defaults/default-watermark";
// Import gradient types from contracts (canonical source)
import type { GradientStop, GradientType } from "@/contracts/generator";
// Import payload generator types and functions from payload-generators module
import {
  type CryptoHelper,
  type EmailHelper,
  type EventHelper,
  type GeoHelper,
  type MeCardHelper,
  type SmsHelper,
  type TelHelper,
  type UrlHelper,
  type VCardHelper,
  type WifiHelper,
} from "@/application/generator";
import type {
  AlignmentStyle,
  AnimationPatternType,
  AnimationTarget,
  AnimationWaveAxis,
  AppLinkHelper,
  AusPayNetHelper,
  BharatQRHelper,
  BizCardHelper,
  CalendarSubHelper,
  CashAppHelper,
  CharacterEncoding,
  CloudLinkHelper,
  ColorMode,
  CropRegion,
  DiffusionKernel,
  DitherKind,
  DuitNowHelper,
  ECCLevel,
  EMVGenericHelper,
  EncodingMode,
  EthereumHelper,
  EventRsvpHelper,
  FinderStyle,
  FitMode,
  FrameStyle,
  GapMode,
  GifDither,
  GifQuantizer,
  GS1Helper,
  HKQRHelper,
  JPQRHelper,
  LightningHelper,
  MaskPattern,
  MessagingHelper,
  ModuleStyle,
  OrderedMatrix,
  OtpAuthHelper,
  OutputFormat,
  OverlayMode,
  OverlayType,
  PayloadKind,
  PayPalMeHelper,
  PremiumAccess,
  QRISHelper,
  QRPhHelper,
  SafetyMode,
  SocialProfileHelper,
  SwissQRBillHelper,
  Tier,
  TimingStyle,
  TWQRHelper,
  VietQRHelper,
} from "./types";
import type { PayloadData } from "./types/payload-data";
import { applyPayloadTransforms } from "./payload-serializers/apply-payload-transforms";
import { PAYLOAD_SERIALIZERS } from "./payload-serializers";

// Re-export types for backward compatibility
export type * from "./types";
export type {
  CryptoHelper,
  EmailHelper,
  EventHelper,
  GeoHelper,
  MeCardHelper,
  SmsHelper,
  TelHelper,
  UrlHelper,
  VCardHelper,
  VCardVersion,
  WifiAuth,
  WifiHelper,
} from "@/application/generator";
export type { GradientStop, GradientType } from "@/contracts/generator";

// Main QR Store State
export interface QRState {
  // UI tier
  tier: Tier;
  setTier: (tier: Tier) => void;

  // Premium access from rewarded ad (temporary Professional tier)
  premiumAccess: PremiumAccess;
  activatePremiumAccess: () => void; // Activates 24-hour premium
  checkPremiumAccess: () => boolean; // Returns true if premium is active
  getEffectiveTier: () => Tier; // Returns 'professional' if premium active, else current tier

  // === PAYLOAD ===
  payload: PayloadData;
  setPayloadKind: (kind: PayloadKind) => void;
  setPayloadText: (text: string) => void;
  setPayloadUrl: (url: Partial<UrlHelper>) => void;
  setPayloadTel: (tel: Partial<TelHelper>) => void;
  setPayloadEmail: (email: Partial<EmailHelper>) => void;
  setPayloadSms: (sms: Partial<SmsHelper>) => void;
  setPayloadGeo: (geo: Partial<GeoHelper>) => void;
  setPayloadWifi: (wifi: Partial<WifiHelper>) => void;
  setPayloadVCard: (vcard: Partial<VCardHelper>) => void;
  setPayloadMeCard: (mecard: Partial<MeCardHelper>) => void;
  setPayloadEvent: (event: Partial<EventHelper>) => void;
  setPayloadCrypto: (crypto: Partial<CryptoHelper>) => void;
  setPayloadOtpAuth: (otpauth: Partial<OtpAuthHelper>) => void;
  // Additional content type setters
  setPayloadBizCard: (bizcard: Partial<BizCardHelper>) => void;
  setPayloadMessaging: (messaging: Partial<MessagingHelper>) => void;
  setPayloadSocialProfile: (socialProfile: Partial<SocialProfileHelper>) => void;
  setPayloadAppLink: (appLink: Partial<AppLinkHelper>) => void;
  setPayloadGS1: (gs1: Partial<GS1Helper>) => void;
  setPayloadCloudLink: (cloudLink: Partial<CloudLinkHelper>) => void;
  setPayloadCalendarSub: (calendarSub: Partial<CalendarSubHelper>) => void;
  setPayloadEventRsvp: (eventRsvp: Partial<EventRsvpHelper>) => void;
  // Payment setters
  setPayloadSwissQRBill: (swissQRBill: Partial<SwissQRBillHelper>) => void;
  setPayloadLightning: (lightning: Partial<LightningHelper>) => void;
  setPayloadEthereum: (ethereum: Partial<EthereumHelper>) => void;
  setPayloadQRIS: (qris: Partial<QRISHelper>) => void;
  setPayloadDuitNow: (duitnow: Partial<DuitNowHelper>) => void;
  setPayloadBharatQR: (bharatqr: Partial<BharatQRHelper>) => void;
  setPayloadVietQR: (vietqr: Partial<VietQRHelper>) => void;
  setPayloadQRPh: (qrph: Partial<QRPhHelper>) => void;
  setPayloadTWQR: (twqr: Partial<TWQRHelper>) => void;
  setPayloadHKQR: (hkqr: Partial<HKQRHelper>) => void;
  setPayloadJPQR: (jpqr: Partial<JPQRHelper>) => void;
  setPayloadAusPayNet: (auspaynet: Partial<AusPayNetHelper>) => void;
  setPayloadPayPalMe: (paypalMe: Partial<PayPalMeHelper>) => void;
  setPayloadCashApp: (cashapp: Partial<CashAppHelper>) => void;
  setPayloadEMVGeneric: (emvGeneric: Partial<EMVGenericHelper>) => void;
  setPayloadValidation: (opts: {
    validate?: boolean;
    normalizeNewlines?: boolean;
    trim?: boolean;
    maxLenGuard?: boolean;
  }) => void;

  // === QR ENCODING ===
  qr: {
    version: number; // 0 = auto, 1-40
    ecc: ECCLevel;
    encodingMode: EncodingMode;
    maskPattern: MaskPattern; // 'auto' or 0-7
    characterEncoding: CharacterEncoding; // Character set for byte mode
    quietZoneModules: number;
    quietZoneMinEnforce: boolean;
    borderModulesExtra: number;
  };
  setQrVersion: (version: number) => void;
  setQrEcc: (ecc: ECCLevel) => void;
  setQrEncodingMode: (mode: EncodingMode) => void;
  setQrMaskPattern: (mask: MaskPattern) => void;
  setQrCharacterEncoding: (encoding: CharacterEncoding) => void;
  setQrQuietZone: (modules: number) => void;
  setQrQuietZoneMinEnforce: (enforce: boolean) => void;

  // === RENDERING ===
  render: {
    modulePx: number;
    crispEdges: boolean;
    pixelSnap: "floor" | "round" | "ceil";
    moduleGapPercent: number;
    gapMode: GapMode;
    moduleStyle: ModuleStyle;
    finderStyle: FinderStyle;
    alignmentStyle: AlignmentStyle;
    timingStyle: TimingStyle;
    cornerRadius: number;
    dotRotationDeg: number;
    eyeOuterStyle: FinderStyle;
    eyeInnerStyle: FinderStyle;
    eyeScale: number;
    frameStyle: FrameStyle;
    frameText: string;
    // Colors
    fgColor: string;
    bgColor: string;
    bgTransparent: boolean;
    palette: string[];
    paletteMode: "position" | "brightness" | "diagonal" | "radial" | "random" | "row" | "column";
    gradient: {
      type: GradientType;
      stops: GradientStop[];
    };
    perModuleColorMode: "solid" | "by_brightness" | "by_position" | "by_overlay" | "by_cluster";
    contrastGuard: boolean;
    minContrastRatio: number;
  };
  setRenderModulePx: (px: number) => void;
  setRenderCrispEdges: (crisp: boolean) => void;
  setRenderModuleGap: (percent: number) => void;
  setRenderGapMode: (mode: GapMode) => void;
  setRenderModuleStyle: (style: ModuleStyle) => void;
  setRenderFinderStyle: (style: FinderStyle) => void;
  setRenderAlignmentStyle: (style: AlignmentStyle) => void;
  setRenderTimingStyle: (style: TimingStyle) => void;
  setRenderCornerRadius: (radius: number) => void;
  setRenderFrameStyle: (style: FrameStyle) => void;
  setRenderFrameText: (text: string) => void;
  setRenderFgColor: (color: string) => void;
  setRenderBgColor: (color: string) => void;
  setRenderBgTransparent: (transparent: boolean) => void;
  setRenderGradient: (gradient: Partial<QRState["render"]["gradient"]>) => void;

  // Internal: saved QR settings before artwork mode override (restored on mode switch back)
  _preArtworkQr: { ecc: ECCLevel; version: number } | null;

  // === OVERLAY ===
  overlay: {
    enabled: boolean;
    file: File | null;
    url: string;
    type: OverlayType;
    framePick: "all" | "every_n" | "max_frames" | "duration_limit";
    // Crop & transform
    cropEnabled: boolean;
    cropRegion: CropRegion;
    fit: FitMode;
    rotateDeg: number;
    flipX: boolean;
    flipY: boolean;
    // Preprocess
    colorMode: ColorMode;
    invert: boolean;
    brightness: number;
    contrast: number;
    gamma: number;
    saturation: number;
    hueRotateDeg: number;
    blurPx: number;
    sharpen: number;
    posterizeLevels: number;
    threshold: number;
    edgeDetect: "off" | "sobel" | "canny";
    // Blend
    mode: OverlayMode;
    intensity: number;
    preserveFinders: boolean;
    preserveTiming: boolean;
    preserveAlignment: boolean;
    protectFormatInfo: boolean;
    protectVersionInfo: boolean;
    // Subpixel
    subpixelGridSize: "2x2" | "3x3" | "4x4";
    subpixelCenterRule: "strict" | "halftone_center";
    subpixelNeutralColor: string;
    subpixelFinderOverride: "solid" | "stylized";
    // Dither
    ditherKind: DitherKind;
    ditherStrength: number;
    finderDitherStrength: number;
    blendPreservations: boolean;
    blendPreservationMode: "overlay" | "dither";
    ditherSerpentine: boolean;
    diffusionKernel: DiffusionKernel;
    orderedMatrix: OrderedMatrix;
    blueNoiseTileSize: number;
    blueNoiseSeed: number;
    colorDither: "none" | "per_channel" | "perceptual";
    // Halftone
    halftoneCell: "per_module" | "n×n";
    halftoneDotShape: "circle" | "square" | "line";
    duotoneColors: [string, string];
    brightnessCurve: "linear" | "s-curve" | "gamma";
    // ECC aware
    eccAwareEnabled: boolean;
    eccAwareRiskBudget: number;
    eccAwareWeightMap: "distance_to_finders" | "block_heatmap" | "empirical_scan_heatmap";
    // GIF specific
    gifUseFrameDelays: boolean;
    gifMaxFps: number;
    gifDisposalHandling: "respect" | "simplify";
    // QR-first mode (forces QR data preservation for high-contrast images)
    qrFirstMode: boolean;
    // QR-Art settings (fragment search for artwork mode)
    qrartIterations: number;
    qrartFragmentLength: number;
    qrartSeed: number;
  };
  setOverlayEnabled: (enabled: boolean) => void;
  setOverlayFile: (file: File | null) => void;
  setOverlayUrl: (url: string) => void;
  clearOverlay: () => void;
  setOverlayType: (type: OverlayType) => void;
  setOverlayCrop: (crop: Partial<{ enabled: boolean; region: CropRegion }>) => void;
  setOverlayFit: (fit: FitMode) => void;
  setOverlayRotate: (deg: number) => void;
  setOverlayFlip: (flip: { x?: boolean; y?: boolean }) => void;
  setOverlayColorMode: (mode: ColorMode) => void;
  setOverlayInvert: (invert: boolean) => void;
  setOverlayBrightness: (brightness: number) => void;
  setOverlayContrast: (contrast: number) => void;
  setOverlayGamma: (gamma: number) => void;
  setOverlayMode: (mode: OverlayMode) => void;
  setOverlayIntensity: (intensity: number) => void;
  setOverlayPreserveFinders: (preserve: boolean) => void;
  setOverlayPreserveTiming: (preserve: boolean) => void;
  setOverlayPreserveAlignment: (preserve: boolean) => void;
  setOverlayDitherKind: (kind: DitherKind) => void;
  setOverlayDitherStrength: (strength: number) => void;
  setOverlayDiffusionKernel: (kernel: DiffusionKernel) => void;
  setOverlaySaturation: (saturation: number) => void;
  setOverlayHueRotate: (hue: number) => void;
  setOverlayBlur: (blur: number) => void;
  setOverlaySharpen: (sharpen: number) => void;
  setOverlayPosterize: (levels: number) => void;
  setOverlayThreshold: (threshold: number) => void;
  setOverlayEdgeDetect: (edge: "off" | "sobel" | "canny") => void;

  // === ANIMATION ===
  animation: {
    speedMs: number;
    loop: boolean;
    bounce: boolean;
    playing: boolean;
    startFrame: number;
    maxFrames: number;
    frameStep: number;
    perFrameDelay: number[];
    interpolate: "none" | "crossfade" | "morph";
    temporalDither: "off" | "blue_noise" | "flicker_safe";
    seed: number;
    pattern: AnimationPatternType;
    target: AnimationTarget;
    waveAxis: AnimationWaveAxis;
    pattern2: AnimationPatternType;
    target2: AnimationTarget;
    waveAxis2: AnimationWaveAxis;
    moduleJitterPx: number;
    colorCycle: boolean;
  };
  setAnimationSpeedMs: (speed: number) => void;
  setAnimationLoop: (loop: boolean) => void;
  setAnimationBounce: (bounce: boolean) => void;
  setAnimationPlaying: (playing: boolean) => void;
  setAnimationStartFrame: (frame: number) => void;
  setAnimationMaxFrames: (frames: number) => void;
  setAnimationFrameStep: (step: number) => void;
  setAnimationInterpolate: (mode: "none" | "crossfade" | "morph") => void;
  setAnimationTemporalDither: (mode: "off" | "blue_noise" | "flicker_safe") => void;

  // === OUTPUT ===
  output: {
    format: OutputFormat;
    widthPx: number;
    heightPx: number;
    quality: number;
    filename: string;
    includeQuietZone: boolean;
    dpi: number;
    bgOverride: string;
    // GIF encoder
    gifPaletteSize: number;
    gifQuantizer: GifQuantizer;
    gifDither: GifDither;
    gifTransparentColor: string;
    gifDisposal: string;
    // SVG
    svgTrueVector: boolean;
    svgShapePrecision: "pixel" | "precise";
    svgEmbedRasterOverlay: boolean;
    svgMetadata: Record<string, string>;
    // Extra formats
    formatExtra: "none" | "eps" | "animated_webp";
  };
  setOutputFormat: (format: OutputFormat) => void;
  setOutputWidth: (width: number) => void;
  setOutputHeight: (height: number) => void;
  setOutputQuality: (quality: number) => void;
  setOutputFilename: (filename: string) => void;
  setOutputGifPaletteSize: (size: number) => void;
  setOutputGifQuantizer: (quantizer: GifQuantizer) => void;
  setOutputSvgTrueVector: (trueVector: boolean) => void;

  // === WATERMARK ===
  watermark: {
    enabled: boolean;
    kind: "text" | "image" | "pattern";
    text: string;
    image: File | null;
    // The 9 positions the renderer's calculateWatermarkPositions actually
    // supports. Old values (corners/edges/behind/quiet_zone) all fell
    // through the renderer switch to top-left padding — see B1 fix.
    position:
      | "top-left"
      | "top-center"
      | "top-right"
      | "center-left"
      | "center"
      | "center-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right";
    opacity: number;
    blend: "normal" | "multiply" | "screen" | "overlay";
  };
  setWatermarkEnabled: (enabled: boolean) => void;
  setWatermarkKind: (kind: QRState["watermark"]["kind"]) => void;
  setWatermarkText: (text: string) => void;
  setWatermarkPosition: (position: QRState["watermark"]["position"]) => void;
  setWatermarkOpacity: (opacity: number) => void;

  // === METADATA ===
  metadata: {
    title: string;
    author: string;
    copyright: string;
    license: string;
    description: string;
    creationTime: boolean;
    customKv: Array<{ k: string; v: string }>;
  };
  setMetadata: (meta: Partial<QRState["metadata"]>) => void;

  // === SAFETY ===
  safety: {
    mode: SafetyMode;
    minModulePx: number;
    minQuietZoneModules: number;
    lockFinders: boolean;
    lockTiming: boolean;
    lockAlign: boolean;
    lockFormat: boolean;
    lockVersion: boolean;
    maxOverlayIntensityByEcc: Record<ECCLevel, number>;
  };
  setSafetyMode: (mode: SafetyMode) => void;
  setSafetyMinModulePx: (px: number) => void;
  setSafetyLocks: (
    locks: Partial<
      Pick<
        QRState["safety"],
        "lockFinders" | "lockTiming" | "lockAlign" | "lockFormat" | "lockVersion"
      >
    >,
  ) => void;

  // === QA / ANALYSIS ===
  qa: {
    contrastCheck: boolean;
    simulateBlurPx: number;
    simulateNoise: number;
    simulateRotationDeg: number;
    scoreReadability: boolean;
    showHeatmap: boolean;
  };
  setQaContrastCheck: (check: boolean) => void;
  setQaSimulateBlur: (blur: number) => void;
  setQaShowHeatmap: (show: boolean) => void;

  // === AUTO-TUNING ===
  auto: {
    pickVersion: boolean;
    pickEcc: boolean;
    reduceIntensityUntilSafe: boolean;
  };
  setAutoPickVersion: (pick: boolean) => void;
  setAutoPickEcc: (pick: boolean) => void;

  // === SHARE ===
  share: {
    directLink: boolean;
    embedHtml: boolean;
    encodeMoreParams: boolean;
  };
  setShare: (share: Partial<QRState["share"]>) => void;

  // === UI STATE ===
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Generate final payload text
  getPayloadText: () => string;
}

// Premium access duration: 24 hours in milliseconds
const PREMIUM_DURATION_MS = 24 * 60 * 60 * 1000;

export const useQRStore = create<QRState>((set, get) => ({
  // Tier
  tier: "basic",
  setTier: (tier) => set({ tier }),

  // Premium access (from watching rewarded ad)
  premiumAccess: {
    active: false,
    expiresAt: null,
  },
  activatePremiumAccess: () =>
    set({
      premiumAccess: {
        active: true,
        expiresAt: Date.now() + PREMIUM_DURATION_MS,
      },
    }),
  checkPremiumAccess: () => {
    const { premiumAccess } = get();
    if (!(premiumAccess.active && premiumAccess.expiresAt)) return false;
    if (Date.now() > premiumAccess.expiresAt) {
      // Premium expired, reset state
      set({ premiumAccess: { active: false, expiresAt: null } });
      return false;
    }
    return true;
  },
  getEffectiveTier: () => {
    const state = get();
    // Check if premium access is active
    if (state.checkPremiumAccess()) {
      return "professional";
    }
    return state.tier;
  },

  // Payload defaults — extracted to ./qr-store-defaults/default-payload.ts
  // (L6 step 1). Other default blocks (qr, render, overlay, animation,
  // output, watermark, metadata, safety) follow the same pattern in
  // subsequent batches.
  payload: DEFAULT_PAYLOAD,
  setPayloadKind: (kind) => set((s) => ({ payload: { ...s.payload, kind } })),
  setPayloadText: (text) => set((s) => ({ payload: { ...s.payload, text } })),
  setPayloadUrl: (url) =>
    set((s) => ({ payload: { ...s.payload, url: { ...s.payload.url, ...url } } })),
  setPayloadTel: (tel) =>
    set((s) => ({ payload: { ...s.payload, tel: { ...s.payload.tel, ...tel } } })),
  setPayloadEmail: (email) =>
    set((s) => ({ payload: { ...s.payload, email: { ...s.payload.email, ...email } } })),
  setPayloadSms: (sms) =>
    set((s) => ({ payload: { ...s.payload, sms: { ...s.payload.sms, ...sms } } })),
  setPayloadGeo: (geo) =>
    set((s) => ({ payload: { ...s.payload, geo: { ...s.payload.geo, ...geo } } })),
  setPayloadWifi: (wifi) =>
    set((s) => ({ payload: { ...s.payload, wifi: { ...s.payload.wifi, ...wifi } } })),
  setPayloadVCard: (vcard) =>
    set((s) => ({ payload: { ...s.payload, vcard: { ...s.payload.vcard, ...vcard } } })),
  setPayloadMeCard: (mecard) =>
    set((s) => ({ payload: { ...s.payload, mecard: { ...s.payload.mecard, ...mecard } } })),
  setPayloadEvent: (event) =>
    set((s) => ({ payload: { ...s.payload, event: { ...s.payload.event, ...event } } })),
  setPayloadCrypto: (crypto) =>
    set((s) => ({ payload: { ...s.payload, crypto: { ...s.payload.crypto, ...crypto } } })),
  setPayloadOtpAuth: (otpauth) =>
    set((s) => ({ payload: { ...s.payload, otpauth: { ...s.payload.otpauth, ...otpauth } } })),
  // Additional content type setters
  setPayloadBizCard: (bizcard) =>
    set((s) => ({ payload: { ...s.payload, bizcard: { ...s.payload.bizcard, ...bizcard } } })),
  setPayloadMessaging: (messaging) =>
    set((s) => ({
      payload: { ...s.payload, messaging: { ...s.payload.messaging, ...messaging } },
    })),
  setPayloadSocialProfile: (socialProfile) =>
    set((s) => ({
      payload: { ...s.payload, socialProfile: { ...s.payload.socialProfile, ...socialProfile } },
    })),
  setPayloadAppLink: (appLink) =>
    set((s) => ({ payload: { ...s.payload, appLink: { ...s.payload.appLink, ...appLink } } })),
  setPayloadGS1: (gs1) =>
    set((s) => ({ payload: { ...s.payload, gs1: { ...s.payload.gs1, ...gs1 } } })),
  setPayloadCloudLink: (cloudLink) =>
    set((s) => ({
      payload: { ...s.payload, cloudLink: { ...s.payload.cloudLink, ...cloudLink } },
    })),
  setPayloadCalendarSub: (calendarSub) =>
    set((s) => ({
      payload: { ...s.payload, calendarSub: { ...s.payload.calendarSub, ...calendarSub } },
    })),
  setPayloadEventRsvp: (eventRsvp) =>
    set((s) => ({
      payload: { ...s.payload, eventRsvp: { ...s.payload.eventRsvp, ...eventRsvp } },
    })),
  // Payment setters
  setPayloadSwissQRBill: (swissQRBill) =>
    set((s) => ({
      payload: { ...s.payload, swissQRBill: { ...s.payload.swissQRBill, ...swissQRBill } },
    })),
  setPayloadLightning: (lightning) =>
    set((s) => ({
      payload: { ...s.payload, lightning: { ...s.payload.lightning, ...lightning } },
    })),
  setPayloadEthereum: (ethereum) =>
    set((s) => ({ payload: { ...s.payload, ethereum: { ...s.payload.ethereum, ...ethereum } } })),
  setPayloadQRIS: (qris) =>
    set((s) => ({ payload: { ...s.payload, qris: { ...s.payload.qris, ...qris } } })),
  setPayloadDuitNow: (duitnow) =>
    set((s) => ({ payload: { ...s.payload, duitnow: { ...s.payload.duitnow, ...duitnow } } })),
  setPayloadBharatQR: (bharatqr) =>
    set((s) => ({ payload: { ...s.payload, bharatqr: { ...s.payload.bharatqr, ...bharatqr } } })),
  setPayloadVietQR: (vietqr) =>
    set((s) => ({ payload: { ...s.payload, vietqr: { ...s.payload.vietqr, ...vietqr } } })),
  setPayloadQRPh: (qrph) =>
    set((s) => ({ payload: { ...s.payload, qrph: { ...s.payload.qrph, ...qrph } } })),
  setPayloadTWQR: (twqr) =>
    set((s) => ({ payload: { ...s.payload, twqr: { ...s.payload.twqr, ...twqr } } })),
  setPayloadHKQR: (hkqr) =>
    set((s) => ({ payload: { ...s.payload, hkqr: { ...s.payload.hkqr, ...hkqr } } })),
  setPayloadJPQR: (jpqr) =>
    set((s) => ({ payload: { ...s.payload, jpqr: { ...s.payload.jpqr, ...jpqr } } })),
  setPayloadAusPayNet: (auspaynet) =>
    set((s) => ({
      payload: { ...s.payload, auspaynet: { ...s.payload.auspaynet, ...auspaynet } },
    })),
  setPayloadPayPalMe: (paypalMe) =>
    set((s) => ({ payload: { ...s.payload, paypalMe: { ...s.payload.paypalMe, ...paypalMe } } })),
  setPayloadCashApp: (cashapp) =>
    set((s) => ({ payload: { ...s.payload, cashapp: { ...s.payload.cashapp, ...cashapp } } })),
  setPayloadEMVGeneric: (emvGeneric) =>
    set((s) => ({
      payload: { ...s.payload, emvGeneric: { ...s.payload.emvGeneric, ...emvGeneric } },
    })),
  setPayloadValidation: (opts) => set((s) => ({ payload: { ...s.payload, ...opts } })),

  // QR encoding defaults — see qr-store-defaults/default-qr.ts (L6).
  qr: DEFAULT_QR,
  setQrVersion: (version) => set((s) => ({ qr: { ...s.qr, version } })),
  setQrEcc: (ecc) => set((s) => ({ qr: { ...s.qr, ecc } })),
  setQrEncodingMode: (encodingMode) => set((s) => ({ qr: { ...s.qr, encodingMode } })),
  setQrMaskPattern: (maskPattern) => set((s) => ({ qr: { ...s.qr, maskPattern } })),
  setQrCharacterEncoding: (characterEncoding) =>
    set((s) => ({ qr: { ...s.qr, characterEncoding } })),
  setQrQuietZone: (quietZoneModules) => set((s) => ({ qr: { ...s.qr, quietZoneModules } })),
  setQrQuietZoneMinEnforce: (quietZoneMinEnforce) =>
    set((s) => ({ qr: { ...s.qr, quietZoneMinEnforce } })),

  // Render defaults — see qr-store-defaults/default-render.ts.
  render: DEFAULT_RENDER,
  setRenderModulePx: (modulePx) => set((s) => ({ render: { ...s.render, modulePx } })),
  setRenderCrispEdges: (crispEdges) => set((s) => ({ render: { ...s.render, crispEdges } })),
  setRenderModuleGap: (moduleGapPercent) =>
    set((s) => ({ render: { ...s.render, moduleGapPercent } })),
  setRenderGapMode: (gapMode) => set((s) => ({ render: { ...s.render, gapMode } })),
  setRenderModuleStyle: (moduleStyle) => set((s) => ({ render: { ...s.render, moduleStyle } })),
  setRenderFinderStyle: (finderStyle) =>
    set((s) => {
      // P1: Only propagate the new finder style into the eye styles
      // when the user hasn't explicitly overridden them. We treat
      // "explicit override" as "current eye style differs from the
      // current finder style" — so flipping the finder still does the
      // obvious thing on first change, but a later edit to either eye
      // style is preserved across subsequent finder changes.
      const eyeOuterFollowsFinder = s.render.eyeOuterStyle === s.render.finderStyle;
      const eyeInnerFollowsFinder = s.render.eyeInnerStyle === s.render.finderStyle;
      return {
        render: {
          ...s.render,
          finderStyle,
          eyeOuterStyle: eyeOuterFollowsFinder ? finderStyle : s.render.eyeOuterStyle,
          eyeInnerStyle: eyeInnerFollowsFinder ? finderStyle : s.render.eyeInnerStyle,
        },
      };
    }),
  setRenderAlignmentStyle: (alignmentStyle) =>
    set((s) => ({ render: { ...s.render, alignmentStyle } })),
  setRenderTimingStyle: (timingStyle) => set((s) => ({ render: { ...s.render, timingStyle } })),
  setRenderCornerRadius: (cornerRadius) => set((s) => ({ render: { ...s.render, cornerRadius } })),
  setRenderFrameStyle: (frameStyle) => set((s) => ({ render: { ...s.render, frameStyle } })),
  setRenderFrameText: (frameText) => set((s) => ({ render: { ...s.render, frameText } })),
  setRenderFgColor: (fgColor) => set((s) => ({ render: { ...s.render, fgColor } })),
  setRenderBgColor: (bgColor) => set((s) => ({ render: { ...s.render, bgColor } })),
  setRenderBgTransparent: (bgTransparent) =>
    set((s) => ({ render: { ...s.render, bgTransparent } })),
  setRenderGradient: (gradient) =>
    set((s) => {
      const merged = { ...s.render.gradient, ...gradient };
      // B2: when the user switches type from "none" to a real gradient,
      // seed a 2-stop palette so the renderer's `if (type === "none" ||
      // !stops?.length)` guard doesn't silently skip rendering. Without
      // this, picking "linear"/"radial"/"conic" looked active in the UI
      // but produced no visible gradient.
      if (gradient.type && gradient.type !== "none" && merged.stops.length === 0) {
        merged.stops = [
          { pos: 0, color: s.render.fgColor },
          { pos: 1, color: s.render.bgColor },
        ];
      }
      return { render: { ...s.render, gradient: merged } };
    }),

  _preArtworkQr: null,

  // Overlay defaults
  overlay: DEFAULT_OVERLAY,
  setOverlayEnabled: (enabled) => set((s) => ({ overlay: { ...s.overlay, enabled } })),
  setOverlayFile: (file) =>
    set((s) => ({ overlay: { ...s.overlay, file, enabled: !!file || !!s.overlay.url } })),
  setOverlayUrl: (url) => set((s) => ({ overlay: { ...s.overlay, url } })),
  clearOverlay: () =>
    set((s) => ({ overlay: { ...s.overlay, file: null, url: "", enabled: false } })),
  setOverlayType: (type) => set((s) => ({ overlay: { ...s.overlay, type } })),
  setOverlayCrop: (crop) =>
    set((s) => ({
      overlay: {
        ...s.overlay,
        cropEnabled: crop.enabled ?? s.overlay.cropEnabled,
        cropRegion: crop.region ?? s.overlay.cropRegion,
      },
    })),
  setOverlayFit: (fit) => set((s) => ({ overlay: { ...s.overlay, fit } })),
  setOverlayRotate: (rotateDeg) => set((s) => ({ overlay: { ...s.overlay, rotateDeg } })),
  setOverlayFlip: (flip) =>
    set((s) => ({
      overlay: {
        ...s.overlay,
        flipX: flip.x ?? s.overlay.flipX,
        flipY: flip.y ?? s.overlay.flipY,
      },
    })),
  setOverlayColorMode: (colorMode) => set((s) => ({ overlay: { ...s.overlay, colorMode } })),
  setOverlayInvert: (invert) => set((s) => ({ overlay: { ...s.overlay, invert } })),
  setOverlayBrightness: (brightness) => set((s) => ({ overlay: { ...s.overlay, brightness } })),
  setOverlayContrast: (contrast) => set((s) => ({ overlay: { ...s.overlay, contrast } })),
  setOverlayGamma: (gamma) => set((s) => ({ overlay: { ...s.overlay, gamma } })),
  setOverlayMode: (mode) =>
    set((s) => {
      const enteringArtwork = mode === "artwork" && s.overlay.mode !== "artwork";
      const leavingArtwork = mode !== "artwork" && s.overlay.mode === "artwork";

      if (enteringArtwork) {
        return {
          overlay: { ...s.overlay, mode },
          qr: { ...s.qr, ecc: "L" as ECCLevel, version: 6 },
          _preArtworkQr: { ecc: s.qr.ecc, version: s.qr.version },
        };
      }

      if (leavingArtwork && s._preArtworkQr) {
        const restored = s._preArtworkQr;
        return {
          overlay: { ...s.overlay, mode },
          qr: { ...s.qr, ecc: restored.ecc, version: restored.version },
          _preArtworkQr: null,
        };
      }

      return { overlay: { ...s.overlay, mode } };
    }),
  setOverlayIntensity: (intensity) => set((s) => ({ overlay: { ...s.overlay, intensity } })),
  setOverlayPreserveFinders: (preserveFinders) =>
    set((s) => ({ overlay: { ...s.overlay, preserveFinders } })),
  setOverlayPreserveTiming: (preserveTiming) =>
    set((s) => ({ overlay: { ...s.overlay, preserveTiming } })),
  setOverlayPreserveAlignment: (preserveAlignment) =>
    set((s) => ({ overlay: { ...s.overlay, preserveAlignment } })),
  setOverlayDitherKind: (ditherKind) => set((s) => ({ overlay: { ...s.overlay, ditherKind } })),
  setOverlayDitherStrength: (ditherStrength) =>
    set((s) => ({ overlay: { ...s.overlay, ditherStrength } })),
  setOverlayDiffusionKernel: (diffusionKernel) =>
    set((s) => ({ overlay: { ...s.overlay, diffusionKernel } })),
  setOverlaySaturation: (saturation) => set((s) => ({ overlay: { ...s.overlay, saturation } })),
  setOverlayHueRotate: (hueRotateDeg) => set((s) => ({ overlay: { ...s.overlay, hueRotateDeg } })),
  setOverlayBlur: (blurPx) => set((s) => ({ overlay: { ...s.overlay, blurPx } })),
  setOverlaySharpen: (sharpen) => set((s) => ({ overlay: { ...s.overlay, sharpen } })),
  setOverlayPosterize: (posterizeLevels) =>
    set((s) => ({ overlay: { ...s.overlay, posterizeLevels } })),
  setOverlayThreshold: (threshold) => set((s) => ({ overlay: { ...s.overlay, threshold } })),
  setOverlayEdgeDetect: (edgeDetect) => set((s) => ({ overlay: { ...s.overlay, edgeDetect } })),

  // Animation defaults — see qr-store-defaults/default-animation.ts.
  animation: DEFAULT_ANIMATION,
  setAnimationSpeedMs: (speedMs) => set((s) => ({ animation: { ...s.animation, speedMs } })),
  setAnimationLoop: (loop) => set((s) => ({ animation: { ...s.animation, loop } })),
  setAnimationBounce: (bounce) => set((s) => ({ animation: { ...s.animation, bounce } })),
  setAnimationPlaying: (playing) => set((s) => ({ animation: { ...s.animation, playing } })),
  setAnimationStartFrame: (startFrame) =>
    set((s) => ({ animation: { ...s.animation, startFrame } })),
  setAnimationMaxFrames: (maxFrames) => set((s) => ({ animation: { ...s.animation, maxFrames } })),
  setAnimationFrameStep: (frameStep) => set((s) => ({ animation: { ...s.animation, frameStep } })),
  setAnimationInterpolate: (interpolate) =>
    set((s) => ({ animation: { ...s.animation, interpolate } })),
  setAnimationTemporalDither: (temporalDither) =>
    set((s) => ({ animation: { ...s.animation, temporalDither } })),

  // Output defaults — see qr-store-defaults/default-output.ts.
  output: DEFAULT_OUTPUT,
  setOutputFormat: (format) => set((s) => ({ output: { ...s.output, format } })),
  setOutputWidth: (widthPx) =>
    set((s) => ({
      output: {
        ...s.output,
        widthPx: Math.max(100, Math.min(2000, Number.isFinite(widthPx) ? widthPx : 400)),
      },
    })),
  setOutputHeight: (heightPx) =>
    set((s) => ({
      output: {
        ...s.output,
        heightPx: Math.max(100, Math.min(2000, Number.isFinite(heightPx) ? heightPx : 400)),
      },
    })),
  setOutputQuality: (quality) => set((s) => ({ output: { ...s.output, quality } })),
  setOutputFilename: (filename) => set((s) => ({ output: { ...s.output, filename } })),
  setOutputGifPaletteSize: (gifPaletteSize) =>
    set((s) => ({ output: { ...s.output, gifPaletteSize } })),
  setOutputGifQuantizer: (gifQuantizer) => set((s) => ({ output: { ...s.output, gifQuantizer } })),
  setOutputSvgTrueVector: (svgTrueVector) =>
    set((s) => ({ output: { ...s.output, svgTrueVector } })),

  // Watermark defaults — see qr-store-defaults/default-watermark.ts.
  watermark: DEFAULT_WATERMARK,
  setWatermarkEnabled: (enabled) => set((s) => ({ watermark: { ...s.watermark, enabled } })),
  setWatermarkKind: (kind) => set((s) => ({ watermark: { ...s.watermark, kind } })),
  setWatermarkText: (text) => set((s) => ({ watermark: { ...s.watermark, text } })),
  setWatermarkPosition: (position) => set((s) => ({ watermark: { ...s.watermark, position } })),
  setWatermarkOpacity: (opacity) => set((s) => ({ watermark: { ...s.watermark, opacity } })),

  // Metadata defaults — see qr-store-defaults/default-metadata.ts.
  metadata: DEFAULT_METADATA,
  setMetadata: (meta) => set((s) => ({ metadata: { ...s.metadata, ...meta } })),

  // Safety defaults — see qr-store-defaults/default-safety.ts.
  safety: DEFAULT_SAFETY,
  setSafetyMode: (mode) => set((s) => ({ safety: { ...s.safety, mode } })),
  setSafetyMinModulePx: (minModulePx) => set((s) => ({ safety: { ...s.safety, minModulePx } })),
  setSafetyLocks: (locks) => set((s) => ({ safety: { ...s.safety, ...locks } })),

  // QA defaults
  qa: {
    contrastCheck: false,
    simulateBlurPx: 0,
    simulateNoise: 0,
    simulateRotationDeg: 0,
    scoreReadability: false,
    showHeatmap: false,
  },
  setQaContrastCheck: (contrastCheck) => set((s) => ({ qa: { ...s.qa, contrastCheck } })),
  setQaSimulateBlur: (simulateBlurPx) => set((s) => ({ qa: { ...s.qa, simulateBlurPx } })),
  setQaShowHeatmap: (showHeatmap) => set((s) => ({ qa: { ...s.qa, showHeatmap } })),

  // Auto defaults
  auto: {
    pickVersion: true,
    pickEcc: false,
    reduceIntensityUntilSafe: false,
  },
  setAutoPickVersion: (pickVersion) => set((s) => ({ auto: { ...s.auto, pickVersion } })),
  setAutoPickEcc: (pickEcc) => set((s) => ({ auto: { ...s.auto, pickEcc } })),

  // Share defaults
  share: {
    directLink: true,
    embedHtml: true,
    encodeMoreParams: false,
  },
  setShare: (share) => set((s) => ({ share: { ...s.share, ...share } })),

  // UI state
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Generate final payload text based on kind
  getPayloadText: () => {
    const { payload } = get();
    const serializer = PAYLOAD_SERIALIZERS[payload.kind];
    if (serializer) return serializer(payload);
    return applyPayloadTransforms(payload.text, payload);
  },
}));
