/**
 * QR Store - Central state management for ANQR
 *
 * Type Alignment with Modules:
 * - Gradient types (GradientStop, GradientType): from @/modules/core
 * - Payload types (UrlHelper, VCardHelper, etc.): from @/modules/payload-generators
 * - QR encoding types (ECCLevel, EncodingMode): align with @/modules/qr-spec (with UI extensions)
 * - Overlay types (OverlayMode, ColorMode, FitMode): align with @/modules/overlay
 * - Dither types (DitherKind, DiffusionKernel): align with @/modules/dither-algorithms
 * - Output types (OutputFormat, GifQuantizer): align with @/modules/exporter
 *
 * Note: Some types are defined locally with UI-specific extensions (e.g., 'auto' for MaskPattern)
 * that are not part of the core module types.
 */
import { create } from 'zustand';
// Import gradient types from core types (canonical source)
import type { GradientStop, GradientType } from '@/modules/core';
// Import payload generator types and functions from payload-generators module
import {
  type CryptoHelper,
  type EmailHelper,
  type EventHelper,
  type GeoHelper,
  generateAppDeepLink,
  generateAusPayNet,
  generateBharatQR,
  generateBizCard,
  generateCashApp,
  generateDuitNow,
  generateEMVMPM,
  generateEthereumEIP681,
  generateEvent,
  generateGS1DigitalLink,
  generateHKQR,
  generateJPQR,
  generateLightning,
  generateMeCard,
  generateMessagingLink,
  generatePayPalMe,
  generateQRIS,
  generateQRPh,
  generateSocialProfile,
  generateSwissQRBill,
  generateTWQR,
  generateVCard,
  generateVietQR,
  type MeCardHelper,
  type SmsHelper,
  type TelHelper,
  type UrlHelper,
  type VCardHelper,
  type WifiHelper,
} from '@/modules/payload-generators';

// Re-export types for backward compatibility
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
} from '@/modules/payload-generators';
export type { GradientStop, GradientType } from '@/modules/core';

// Tier levels
export type Tier = 'basic' | 'advanced' | 'professional';

// Premium access state (from watching rewarded ad)
export interface PremiumAccess {
  active: boolean;
  expiresAt: number | null; // timestamp when access expires (24 hours from activation)
}

// Payload types - cleaned up list (removed closed/proprietary payment systems)
export type PayloadKind =
  // Core
  | 'plain_text'
  | 'url'
  | 'tel'
  | 'email'
  | 'sms'
  | 'geo'
  // Contact/Identity
  | 'vcard'
  | 'mecard'
  | 'bizcard'
  // Network/Device
  | 'wifi'
  | 'app_link'
  // Calendar/Productivity
  | 'event'
  | 'event_rsvp'
  | 'calendar_subscription'
  // Social/Communication
  | 'social_profile'
  | 'messaging_link'
  // Payments (open specs only)
  | 'epc_sepa'
  | 'upi'
  | 'paynow'
  | 'promptpay'
  | 'pix'
  | 'crypto'
  // Additional payment standards
  | 'swiss_qr_bill'
  | 'lightning'
  | 'ethereum_eip681'
  // EMV-based national payment schemes
  | 'qris'
  | 'duitnow'
  | 'bharatqr'
  | 'vietqr'
  | 'qrph'
  | 'twqr'
  | 'hkqr'
  | 'jpqr'
  | 'auspaynet'
  // Payment link services
  | 'paypal_me'
  | 'cashapp'
  // Generic EMV
  | 'emv_generic'
  // Industrial/Enterprise
  | 'gs1_digital_link'
  // Marketing/Dynamic
  | 'short_link'
  | 'utm_link'
  // Custom
  | 'custom';

// QR encoding types
// Note: These align with @/modules/qr-spec types but include UI-specific extensions (e.g., 'auto')
export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
export type MaskPattern = 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Character encoding (ECI - Extended Channel Interpretation)
// Common ECI assignment numbers:
// - 'default' = ISO-8859-1 (Latin-1) - QR default, no ECI header
// - 'utf8' = UTF-8 (ECI 26) - Full Unicode support
// - 'iso-8859-1' = ISO-8859-1 (ECI 1) - Western European
// - 'shift-jis' = Shift-JIS (ECI 20) - Japanese
// Common ECI assignment numbers:
// - 'default' = ISO-8859-1 (Latin-1) - QR default, no ECI header
// - 'utf8' = UTF-8 (ECI 26) - Full Unicode support
// - 'iso-8859-1' = ISO-8859-1 (ECI 1) - Western European
// - 'shift-jis' = Shift-JIS (ECI 20) - Japanese
export type CharacterEncoding = 'default' | 'utf8' | 'iso-8859-1' | 'shift-jis';

// Rendering
export type ModuleStyle = 'square' | 'rounded' | 'dots' | 'diamond' | 'connected';
export type FinderStyle = 'square' | 'rounded' | 'circle';
export type AlignmentStyle = 'match_finder' | 'square' | 'rounded' | 'circle';
export type TimingStyle = 'match_module' | 'solid' | 'dashed';
export type GapMode = 'none' | 'inset' | 'stroke' | 'negative_space';
// GradientType is imported from @/modules/core and re-exported above
export type FrameStyle = 'none' | 'rounded_frame' | 'sticker' | 'tag';

// Overlay types
// Note: These align with @/modules/overlay types
export type OverlayMode =
  | 'center'
  | 'blend'
  | 'halftone'
  | 'halftone-dithered'
  | 'mosaic'
  | 'gapfill'
  | 'brightness'
  | 'duotone'
  | 'subpixel'
  | 'dithered'
  | 'blue-noise'
  | 'pixelate'
  | 'outline'
  | 'wave'
  | 'subpixel-size'
  | 'dither'
  | 'extreme'
  | 'artwork';
export type ColorMode = 'color' | 'grayscale' | 'bw';
export type FitMode = 'cover' | 'contain' | 'stretch';
export type OverlayType = 'static' | 'gif' | 'apng' | 'webp_anim' | 'video';

// Dither types
// Note: These align with @/modules/dither-algorithms types
export type DitherKind =
  // Error diffusion
  | 'error_diffusion'
  // Ordered/threshold
  | 'ordered_bayer'
  | 'ordered_clustered'
  | 'ordered_void_cluster'
  | 'blue_noise_threshold'
  | 'true_dither'
  // Noise-based
  | 'blue_noise'
  | 'white_noise'
  | 'gaussian_noise'
  | 'triangular_noise'
  // Hybrid/Advanced
  | 'blue_noise_error_diffusion'
  | 'screened_blue_noise'
  | 'perceptual'
  | 'edge_aware'
  | 'adaptive_threshold'
  | 'temporal_blue_noise';

export type DiffusionKernel =
  | 'floyd_steinberg'
  | 'jarvis_judice_ninke'
  | 'stucki'
  | 'burkes'
  | 'sierra'
  | 'sierra_2'
  | 'sierra_lite'
  | 'atkinson';

export type OrderedMatrix = 'bayer2' | 'bayer4' | 'bayer8' | 'clustered_dot' | 'void_cluster';

// Output types
// Note: These align with @/modules/exporter types
export type OutputFormat = 'png' | 'webp' | 'gif' | 'svg';
export type GifQuantizer = 'median_cut' | 'neuquant' | 'octree';
export type GifDither = 'off' | 'floyd' | 'ordered';

export type AnimationPatternType = 'none' | 'pulse' | 'wave' | 'scanline' | 'shimmer' | 'drift';
export type AnimationTarget = 'result' | 'modules' | 'both';
export type AnimationWaveAxis = 'x' | 'y' | 'xy';

// Safety
export type SafetyMode = 'off' | 'balanced' | 'strict';

// WiFi auth types - imported from payload-generators and re-exported above
// VCard version - imported from payload-generators and re-exported above

// Gradient types are now imported from @/modules/core and re-exported above.

// Crop region
export interface CropRegion {
  x: number;
  y: number;
  size: number;
}

// Helper types are now imported from @/modules/payload-generators and re-exported above.
// This eliminates circular dependencies and establishes payload-generators as the canonical source.

// OTP Auth helper
export interface OtpAuthHelper {
  issuer?: string;
  account?: string;
  secret?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  counter?: number;
  type?: 'totp' | 'hotp';
}

// BizCard helper
export interface BizCardHelper {
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Messaging link helper
export interface MessagingHelper {
  platform: 'whatsapp' | 'telegram' | 'signal' | 'viber' | 'line' | 'messenger';
  identifier: string;
  message?: string;
}

// Social profile helper
export interface SocialProfileHelper {
  platform:
    | 'linkedin'
    | 'twitter'
    | 'instagram'
    | 'facebook'
    | 'tiktok'
    | 'youtube'
    | 'github'
    | 'other';
  username: string;
}

// App deep link helper
export interface AppLinkHelper {
  platform: 'universal' | 'android' | 'ios' | 'custom';
  scheme?: string;
  host?: string;
  path?: string;
  package?: string;
  fallbackUrl?: string;
}

// GS1 Digital Link helper
export interface GS1Helper {
  gtin: string;
  serial?: string;
  batch?: string;
  expiry?: string;
  resolver: string;
}

// Cloud storage link helper
export interface CloudLinkHelper {
  service: 'gdrive' | 'dropbox' | 'onedrive' | 'icloud' | 'box' | 'other';
  url: string;
}

// Calendar subscription helper
export interface CalendarSubHelper {
  url: string;
  calendarName?: string;
}

// Event RSVP helper
export interface EventRsvpHelper {
  summary?: string;
  location?: string;
  description?: string;
  start?: string;
  end?: string;
  organizerEmail?: string;
  rsvpUrl?: string;
}

// Swiss QR-bill helper (SIX payment standard)
export interface SwissQRBillHelper {
  creditorIBAN: string;
  creditorName: string;
  creditorAddressType: 'S' | 'K'; // S=Structured, K=Combined
  creditorStreet?: string;
  creditorBuildingNumber?: string;
  creditorPostalCode?: string;
  creditorCity?: string;
  creditorCountry: string;
  amount?: number;
  currency: 'CHF' | 'EUR';
  referenceType: 'QRR' | 'SCOR' | 'NON';
  reference?: string;
  unstructuredMessage?: string;
  billInformation?: string;
}

// Lightning Network helper (BOLT11)
export interface LightningHelper {
  invoice: string; // BOLT11 encoded invoice string
}

// Ethereum EIP-681 helper
export interface EthereumHelper {
  targetAddress: string;
  chainId?: number; // 1=Mainnet, 137=Polygon, etc.
  value?: string; // Amount in wei
  gas?: number;
  gasLimit?: number;
  gasPrice?: string;
  tokenAddress?: string; // For ERC-20 transfers
  tokenValue?: string; // For ERC-20 transfers (amount in token's smallest unit)
  functionName?: string; // For contract calls
}

// QRIS (Indonesia) helper
export interface QRISHelper {
  merchantId: string;
  nmid?: string; // National Merchant ID
  merchantCriteria?: '00' | '01' | '02' | '03'; // UMI classification
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  amount?: number;
  feeType?: 'FIXED' | 'PERCENT';
  feeAmount?: number;
  terminalLabel?: string;
}

// DuitNow (Malaysia) helper
export interface DuitNowHelper {
  proxyType: 'NRIC' | 'MOBILE' | 'PASSPORT' | 'ARMY' | 'BUSINESS' | 'OTHERS';
  proxyValue: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}

// BharatQR (India) helper
export interface BharatQRHelper {
  merchantVPA?: string;
  merchantPAN?: string;
  merchantID?: string;
  merchantName: string;
  merchantCity: string;
  mcc?: string;
  amount?: number;
  gstDetails?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  terminalId?: string;
}

// VietQR (Vietnam) helper
export interface VietQRHelper {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  serviceCode?: 'QRPUSH' | 'QRIBFTTA' | 'QRIBFTTC';
  amount?: number;
  description?: string;
}

// QR Ph (Philippines) helper
export interface QRPhHelper {
  accountNumber: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  reference?: string;
}

// TWQR (Taiwan) helper
export interface TWQRHelper {
  merchantId: string;
  merchantName: string;
  merchantCity?: string;
  taxId?: string;
  amount?: number;
}

// HKQR (Hong Kong) helper
export interface HKQRHelper {
  fpsId?: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
}

// JPQR (Japan) helper
export interface JPQRHelper {
  storeId: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
}

// AusPayNet (Australia) helper
// Per NPP spec: Need either PayID OR BSB+AccountNumber for routing
// MerchantName is OPTIONAL - payer sees registered name from NPP lookup
export interface AusPayNetHelper {
  payId?: string;
  payIdType?: 'EMAIL' | 'MOBILE' | 'ABN' | 'ORG';
  bsb?: string;
  accountNumber?: string;
  merchantName?: string; // Optional - NPP lookup shows registered name to payer
  merchantCity?: string;
  amount?: number;
  reference?: string;
}

// PayPal.Me helper
export interface PayPalMeHelper {
  username: string;
  amount?: number;
  currencyCode?: string;
}

// Cash App helper
export interface CashAppHelper {
  cashtag: string;
  amount?: number;
}

// Generic EMV QR helper
export interface EMVGenericHelper {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  countryCode: string;
  currencyCode: string;
  amount?: number;
  isStatic?: boolean;
  tipIndicator?: 'none' | 'prompt' | 'fixed' | 'percent';
  tipAmount?: number;
  tipPercent?: number;
  storeLabel?: string;
  customerLabel?: string;
  terminalLabel?: string;
  loyaltyNumber?: string;
  reference?: string;
  purposeOfTransaction?: string;
  postalCode?: string;
  mcc?: string;
}

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
  payload: {
    kind: PayloadKind;
    text: string;
    // Helpers
    url: UrlHelper;
    tel: TelHelper;
    email: EmailHelper;
    sms: SmsHelper;
    geo: GeoHelper;
    wifi: WifiHelper;
    vcard: VCardHelper;
    mecard: MeCardHelper;
    event: EventHelper;
    crypto: CryptoHelper;
    otpauth: OtpAuthHelper;
    // Additional content type helpers
    bizcard: BizCardHelper;
    messaging: MessagingHelper;
    socialProfile: SocialProfileHelper;
    appLink: AppLinkHelper;
    gs1: GS1Helper;
    cloudLink: CloudLinkHelper;
    calendarSub: CalendarSubHelper;
    eventRsvp: EventRsvpHelper;
    // Payment helpers
    swissQRBill: SwissQRBillHelper;
    lightning: LightningHelper;
    ethereum: EthereumHelper;
    qris: QRISHelper;
    duitnow: DuitNowHelper;
    bharatqr: BharatQRHelper;
    vietqr: VietQRHelper;
    qrph: QRPhHelper;
    twqr: TWQRHelper;
    hkqr: HKQRHelper;
    jpqr: JPQRHelper;
    auspaynet: AusPayNetHelper;
    paypalMe: PayPalMeHelper;
    cashapp: CashAppHelper;
    emvGeneric: EMVGenericHelper;
    // Validation
    validate: boolean;
    normalizeNewlines: boolean;
    trim: boolean;
    maxLenGuard: boolean;
  };
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
    pixelSnap: 'floor' | 'round' | 'ceil';
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
    paletteMode: 'position' | 'brightness' | 'diagonal' | 'radial' | 'random' | 'row' | 'column';
    gradient: {
      type: GradientType;
      stops: GradientStop[];
    };
    perModuleColorMode: 'solid' | 'by_brightness' | 'by_position' | 'by_overlay' | 'by_cluster';
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
  setRenderGradient: (gradient: Partial<QRState['render']['gradient']>) => void;

  // Internal: saved QR settings before artwork mode override (restored on mode switch back)
  _preArtworkQr: { ecc: ECCLevel; version: number } | null;

  // === OVERLAY ===
  overlay: {
    enabled: boolean;
    file: File | null;
    url: string;
    type: OverlayType;
    framePick: 'all' | 'every_n' | 'max_frames' | 'duration_limit';
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
    edgeDetect: 'off' | 'sobel' | 'canny';
    // Blend
    mode: OverlayMode;
    intensity: number;
    preserveFinders: boolean;
    preserveTiming: boolean;
    preserveAlignment: boolean;
    protectFormatInfo: boolean;
    protectVersionInfo: boolean;
    // Subpixel
    subpixelGridSize: '2x2' | '3x3' | '4x4';
    subpixelCenterRule: 'strict' | 'halftone_center';
    subpixelNeutralColor: string;
    subpixelFinderOverride: 'solid' | 'stylized';
    // Dither
    ditherKind: DitherKind;
    ditherStrength: number;
    finderDitherStrength: number;
    blendPreservations: boolean;
    blendPreservationMode: 'overlay' | 'dither';
    ditherSerpentine: boolean;
    diffusionKernel: DiffusionKernel;
    orderedMatrix: OrderedMatrix;
    blueNoiseTileSize: number;
    blueNoiseSeed: number;
    colorDither: 'none' | 'per_channel' | 'perceptual';
    // Halftone
    halftoneCell: 'per_module' | 'n×n';
    halftoneDotShape: 'circle' | 'square' | 'line';
    duotoneColors: [string, string];
    brightnessCurve: 'linear' | 's-curve' | 'gamma';
    // ECC aware
    eccAwareEnabled: boolean;
    eccAwareRiskBudget: number;
    eccAwareWeightMap: 'distance_to_finders' | 'block_heatmap' | 'empirical_scan_heatmap';
    // GIF specific
    gifUseFrameDelays: boolean;
    gifMaxFps: number;
    gifDisposalHandling: 'respect' | 'simplify';
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
  setOverlayEdgeDetect: (edge: 'off' | 'sobel' | 'canny') => void;

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
    interpolate: 'none' | 'crossfade' | 'morph';
    temporalDither: 'off' | 'blue_noise' | 'flicker_safe';
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
    svgShapePrecision: 'pixel' | 'precise';
    svgEmbedRasterOverlay: boolean;
    svgMetadata: Record<string, string>;
    // Extra formats
    formatExtra: 'none' | 'eps' | 'animated_webp';
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
    kind: 'text' | 'image' | 'pattern';
    text: string;
    image: File | null;
    position: 'center' | 'corners' | 'edges' | 'behind' | 'quiet_zone';
    opacity: number;
    blend: 'normal' | 'multiply' | 'screen' | 'overlay';
  };
  setWatermarkEnabled: (enabled: boolean) => void;
  setWatermarkKind: (kind: QRState['watermark']['kind']) => void;
  setWatermarkText: (text: string) => void;
  setWatermarkPosition: (position: QRState['watermark']['position']) => void;
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
  setMetadata: (meta: Partial<QRState['metadata']>) => void;

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
        QRState['safety'],
        'lockFinders' | 'lockTiming' | 'lockAlign' | 'lockFormat' | 'lockVersion'
      >
    >
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
  setShare: (share: Partial<QRState['share']>) => void;

  // === UI STATE ===
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Generate final payload text
  getPayloadText: () => string;
}

// ---------------------------------------------------------------------------
// Payload serializer helpers (extracted from getPayloadText switch)
// ---------------------------------------------------------------------------
type PayloadData = QRState['payload'];

function applyPayloadTransforms(text: string, payload: PayloadData): string {
  let result = text;
  if (payload.trim) {
    result = result.trim();
  }
  if (payload.normalizeNewlines) {
    result = result.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  }
  return result;
}

function serializeUrlWithUtm(payload: PayloadData): string {
  let url = payload.url.href;
  if (payload.url.forceHttps && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  const params = new URLSearchParams();
  if (payload.url.utmSource) params.set('utm_source', payload.url.utmSource);
  if (payload.url.utmMedium) params.set('utm_medium', payload.url.utmMedium);
  if (payload.url.utmCampaign) params.set('utm_campaign', payload.url.utmCampaign);
  if (payload.url.utmTerm) params.set('utm_term', payload.url.utmTerm);
  if (payload.url.utmContent) params.set('utm_content', payload.url.utmContent);
  const paramStr = params.toString();
  if (!paramStr) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${paramStr}`;
}

function serializeEmail(payload: PayloadData): string {
  const mailto = `mailto:${payload.email.to}`;
  const params = new URLSearchParams();
  if (payload.email.subject) params.set('subject', payload.email.subject);
  if (payload.email.body) params.set('body', payload.email.body);
  const paramStr = params.toString();
  return paramStr ? `${mailto}?${paramStr}` : mailto;
}

function serializeSms(payload: PayloadData): string {
  let sms = `sms:${payload.sms.number}`;
  if (payload.sms.body) sms += `?body=${encodeURIComponent(payload.sms.body)}`;
  return sms;
}

function serializeWifi(payload: PayloadData): string {
  const w = payload.wifi;
  let wifi = `WIFI:T:${w.auth};S:${w.ssid};`;
  if (w.password) wifi += `P:${w.password};`;
  if (w.hidden) wifi += 'H:true;';
  wifi += ';';
  return wifi;
}

function serializeCrypto(payload: PayloadData): string {
  const c = payload.crypto;
  const payment = `${c.type}:${c.address}`;
  const params = new URLSearchParams();
  if (c.amount) params.set('amount', c.amount.toString());
  if (c.label) params.set('label', c.label);
  const paramStr = params.toString();
  return paramStr ? `${payment}?${paramStr}` : payment;
}

function serializeCalendarSubscription(payload: PayloadData): string {
  const calSub = payload.calendarSub;
  let url = calSub.url || payload.text;
  if (url.startsWith('https://')) {
    url = url.replace('https://', 'webcal://');
  } else if (url.startsWith('http://')) {
    url = url.replace('http://', 'webcal://');
  } else if (url && !url.startsWith('webcal://')) {
    url = `webcal://${url}`;
  }
  if (calSub.calendarName && url) {
    url += url.includes('?') ? '&' : '?';
    url += `name=${encodeURIComponent(calSub.calendarName)}`;
  }
  return url;
}

function serializeEventRsvp(payload: PayloadData): string {
  const rsvp = payload.eventRsvp;
  if (rsvp.summary || rsvp.start) {
    return generateEvent({
      summary: rsvp.summary,
      location: rsvp.location,
      description: rsvp.description
        ? rsvp.rsvpUrl
          ? `${rsvp.description}\n\nRSVP: ${rsvp.rsvpUrl}`
          : rsvp.description
        : rsvp.rsvpUrl
          ? `RSVP: ${rsvp.rsvpUrl}`
          : undefined,
      start: rsvp.start,
      end: rsvp.end,
    });
  }
  const url = rsvp.rsvpUrl || payload.text;
  if (url.includes('@') && !url.startsWith('mailto:') && !url.startsWith('http')) {
    return `mailto:${url}?subject=RSVP`;
  }
  return url;
}

function serializeGS1DigitalLink(payload: PayloadData): string {
  const gs1 = payload.gs1;
  const gtin = gs1.gtin || payload.text;
  if (gtin) {
    return generateGS1DigitalLink({
      gtin: gtin.replaceAll(/[^\d]/g, ''),
      baseUrl: gs1.resolver ? `https://${gs1.resolver}` : undefined,
      ser: gs1.serial || undefined,
      lot: gs1.batch || undefined,
      expiry: gs1.expiry?.replaceAll('-', '') || undefined,
    });
  }
  return '';
}

function serializeAppLink(payload: PayloadData): string {
  const app = payload.appLink;
  if (app.platform === 'universal') {
    let url =
      app.scheme && app.host ? `${app.scheme}://${app.host}${app.path || ''}` : payload.text;
    if (url && !url.includes('://')) {
      url = `https://${url}`;
    }
    return url || '';
  }
  if (app.platform === 'custom') {
    if (app.scheme && app.host) {
      return `${app.scheme}://${app.host}${app.path || ''}`;
    }
    return payload.text;
  }
  return generateAppDeepLink(app.platform, {
    scheme: app.scheme,
    host: app.host,
    path: app.path,
    package: app.package,
    fallbackUrl: app.fallbackUrl,
  });
}

function serializeSwissQRBill(payload: PayloadData): string {
  const sqb = payload.swissQRBill;
  if (!(sqb.creditorIBAN && sqb.creditorName)) return '';
  return generateSwissQRBill({
    creditorIBAN: sqb.creditorIBAN,
    creditorName: sqb.creditorName,
    creditorAddressType: sqb.creditorAddressType,
    creditorStreet: sqb.creditorStreet,
    creditorBuildingNumber: sqb.creditorBuildingNumber,
    creditorPostalCode: sqb.creditorPostalCode,
    creditorCity: sqb.creditorCity,
    creditorCountry: sqb.creditorCountry,
    amount: sqb.amount,
    currency: sqb.currency,
    referenceType: sqb.referenceType,
    reference: sqb.reference,
    unstructuredMessage: sqb.unstructuredMessage,
    billInformation: sqb.billInformation,
  });
}

function serializeEthereumEIP681(payload: PayloadData): string {
  const eth = payload.ethereum;
  if (!eth.targetAddress) return '';
  return generateEthereumEIP681({
    targetAddress: eth.targetAddress,
    chainId: eth.chainId,
    value: eth.value,
    gas: eth.gas,
    gasLimit: eth.gasLimit,
    gasPrice: eth.gasPrice,
    tokenAddress: eth.tokenAddress,
    tokenValue: eth.tokenValue,
    functionName: eth.functionName,
  });
}

function serializeQRIS(payload: PayloadData): string {
  const q = payload.qris;
  if (!q.merchantName) return '';
  return generateQRIS({
    merchantID: q.merchantId,
    nmid: q.nmid,
    merchantCriteria: q.merchantCriteria,
    merchantName: q.merchantName,
    merchantCity: q.merchantCity,
    postalCode: q.postalCode,
    amount: q.amount,
    feeType: q.feeType,
    feeAmount: q.feeAmount,
    terminalLabel: q.terminalLabel,
  });
}

function serializeDuitNow(payload: PayloadData): string {
  const d = payload.duitnow;
  if (!(d.proxyValue && d.merchantName)) return '';
  return generateDuitNow({
    proxyType: d.proxyType,
    proxyValue: d.proxyValue,
    merchantName: d.merchantName,
    merchantCity: d.merchantCity,
    amount: d.amount,
    reference: d.reference,
  });
}

function serializeBharatQR(payload: PayloadData): string {
  const b = payload.bharatqr;
  if (!b.merchantName) return '';
  return generateBharatQR({
    merchantVPA: b.merchantVPA,
    merchantPAN: b.merchantPAN,
    merchantID: b.merchantID,
    merchantName: b.merchantName,
    merchantCity: b.merchantCity,
    mcc: b.mcc,
    amount: b.amount,
    gstDetails: b.gstDetails,
    invoiceNumber: b.invoiceNumber,
    referenceNumber: b.referenceNumber,
    terminalId: b.terminalId,
  });
}

function serializeVietQR(payload: PayloadData): string {
  const v = payload.vietqr;
  if (!(v.bankBin && v.accountNumber)) return '';
  return generateVietQR({
    bankBin: v.bankBin,
    accountNumber: v.accountNumber,
    accountName: v.accountName,
    serviceCode: v.serviceCode,
    amount: v.amount,
    description: v.description,
  });
}

function serializeQRPh(payload: PayloadData): string {
  const p = payload.qrph;
  if (!(p.accountNumber && p.merchantName)) return '';
  return generateQRPh({
    accountNumber: p.accountNumber,
    merchantName: p.merchantName,
    merchantCity: p.merchantCity,
    amount: p.amount,
    reference: p.reference,
  });
}

function serializeTWQR(payload: PayloadData): string {
  const t = payload.twqr;
  if (!t.merchantName) return '';
  return generateTWQR({
    merchantId: t.merchantId,
    merchantName: t.merchantName,
    merchantCity: t.merchantCity,
    taxId: t.taxId,
    amount: t.amount,
  });
}

function serializeHKQR(payload: PayloadData): string {
  const h = payload.hkqr;
  if (!(h.fpsId || h.merchantName)) return '';
  return generateHKQR({
    fpsId: h.fpsId || undefined,
    merchantName: h.merchantName,
    merchantCity: h.merchantCity || undefined,
    amount: h.amount,
    reference: undefined,
  });
}

function serializeJPQR(payload: PayloadData): string {
  const j = payload.jpqr;
  if (!j.merchantName) return '';
  return generateJPQR({
    storeId: j.storeId,
    merchantName: j.merchantName,
    merchantCity: j.merchantCity,
    amount: j.amount,
  });
}

function serializeAusPayNet(payload: PayloadData): string {
  const a = payload.auspaynet;
  if (!(a.payId || (a.bsb && a.accountNumber))) return '';
  return generateAusPayNet({
    payId: a.payId,
    payIdType: a.payIdType,
    bsb: a.bsb,
    accountNumber: a.accountNumber,
    merchantName: a.merchantName,
    merchantCity: a.merchantCity,
    amount: a.amount,
    reference: a.reference,
  });
}

function serializePayPalMe(payload: PayloadData): string {
  const pp = payload.paypalMe;
  if (!pp.username) return '';
  return generatePayPalMe({
    username: pp.username,
    amount: pp.amount,
    currencyCode: pp.currencyCode,
  });
}

function serializeCashApp(payload: PayloadData): string {
  const ca = payload.cashapp;
  if (!ca.cashtag) return '';
  return generateCashApp({
    cashtag: ca.cashtag,
    amount: ca.amount,
  });
}

function serializeEMVGeneric(payload: PayloadData): string {
  const emv = payload.emvGeneric;
  if (!(emv.merchantName && emv.countryCode && emv.currencyCode)) return '';
  const tipIndicatorMap: Record<string, '01' | '02' | '03' | undefined> = {
    prompt: '01',
    fixed: '02',
    percent: '03',
    none: undefined,
  };
  return generateEMVMPM({
    merchantName: emv.merchantName,
    merchantCity: emv.merchantCity,
    countryCode: emv.countryCode,
    currencyCode: emv.currencyCode,
    amount: emv.amount,
    isStatic: emv.isStatic,
    tipIndicator: emv.tipIndicator ? tipIndicatorMap[emv.tipIndicator] : undefined,
    tipFixed: emv.tipAmount,
    tipPercentage: emv.tipPercent,
    storeLabel: emv.storeLabel,
    customerLabel: emv.customerLabel,
    terminalLabel: emv.terminalLabel,
    loyaltyNumber: emv.loyaltyNumber,
    referenceLabel: emv.reference,
    purposeOfTransaction: emv.purposeOfTransaction,
    postalCode: emv.postalCode,
    mcc: emv.mcc,
  });
}

const PAYLOAD_SERIALIZERS: Partial<Record<PayloadKind, (payload: PayloadData) => string>> = {
  plain_text: (p) => applyPayloadTransforms(p.text, p),
  url: serializeUrlWithUtm,
  tel: (p) => `tel:${p.tel.number}`,
  email: serializeEmail,
  sms: serializeSms,
  geo: (p) => `geo:${p.geo.lat},${p.geo.lon}`,
  wifi: serializeWifi,
  vcard: (p) => generateVCard(p.vcard),
  mecard: (p) => generateMeCard(p.mecard),
  event: (p) => generateEvent(p.event),
  crypto: serializeCrypto,
  bizcard: (p) => generateBizCard(p.bizcard),
  calendar_subscription: serializeCalendarSubscription,
  event_rsvp: serializeEventRsvp,
  social_profile: (p) => generateSocialProfile(p.socialProfile.platform, p.socialProfile.username),
  messaging_link: (p) =>
    generateMessagingLink(p.messaging.platform, p.messaging.identifier, p.messaging.message),
  gs1_digital_link: serializeGS1DigitalLink,
  app_link: serializeAppLink,
  utm_link: serializeUrlWithUtm,
  short_link: (p) => p.text,
  swiss_qr_bill: serializeSwissQRBill,
  lightning: (p) =>
    p.lightning.invoice ? generateLightning({ invoice: p.lightning.invoice }) : '',
  ethereum_eip681: serializeEthereumEIP681,
  qris: serializeQRIS,
  duitnow: serializeDuitNow,
  bharatqr: serializeBharatQR,
  vietqr: serializeVietQR,
  qrph: serializeQRPh,
  twqr: serializeTWQR,
  hkqr: serializeHKQR,
  jpqr: serializeJPQR,
  auspaynet: serializeAusPayNet,
  paypal_me: serializePayPalMe,
  cashapp: serializeCashApp,
  emv_generic: serializeEMVGeneric,
  custom: (p) => applyPayloadTransforms(p.text, p),
};

// Premium access duration: 24 hours in milliseconds
const PREMIUM_DURATION_MS = 24 * 60 * 60 * 1000;

export const useQRStore = create<QRState>((set, get) => ({
  // Tier
  tier: 'basic',
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
      return 'professional';
    }
    return state.tier;
  },

  // Payload defaults
  payload: {
    kind: 'url',
    text: 'https://anqr.link',
    url: { href: 'https://anqr.link', forceHttps: false },
    tel: { number: '' },
    email: { to: '' },
    sms: { number: '' },
    geo: { lat: 0, lon: 0 },
    wifi: { ssid: '', auth: 'WPA2', hidden: false },
    vcard: { version: '2.1' },
    mecard: {},
    event: {},
    crypto: { type: 'bitcoin', address: '' },
    otpauth: { type: 'totp' },
    // Additional content type defaults
    bizcard: {},
    messaging: { platform: 'whatsapp', identifier: '' },
    socialProfile: { platform: 'linkedin', username: '' },
    appLink: { platform: 'universal' },
    gs1: { gtin: '', resolver: 'id.gs1.org' },
    cloudLink: { service: 'gdrive', url: '' },
    calendarSub: { url: '' },
    eventRsvp: {},
    // Payment helpers defaults
    swissQRBill: {
      creditorIBAN: '',
      creditorName: '',
      creditorAddressType: 'S',
      creditorCountry: 'CH',
      currency: 'CHF',
      referenceType: 'NON',
    },
    lightning: { invoice: '' },
    ethereum: { targetAddress: '' },
    qris: { merchantId: '', merchantName: '', merchantCity: '' },
    duitnow: { proxyType: 'MOBILE', proxyValue: '', merchantName: '' },
    bharatqr: { merchantName: '', merchantCity: '' },
    vietqr: { bankBin: '', accountNumber: '' },
    qrph: { accountNumber: '', merchantName: '', merchantCity: '' },
    twqr: { merchantId: '', merchantName: '', merchantCity: '' },
    hkqr: { fpsId: '', merchantName: '' },
    jpqr: { storeId: '', merchantName: '' },
    auspaynet: { merchantName: '' },
    paypalMe: { username: '' },
    cashapp: { cashtag: '' },
    emvGeneric: {
      merchantId: '',
      merchantName: '',
      merchantCity: '',
      countryCode: '',
      currencyCode: '',
    },
    validate: false,
    normalizeNewlines: false,
    trim: true,
    maxLenGuard: true,
  },
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

  // QR defaults
  qr: {
    version: 0,
    ecc: 'H',
    encodingMode: 'auto',
    maskPattern: 'auto',
    characterEncoding: 'default',
    quietZoneModules: 4,
    quietZoneMinEnforce: true,
    borderModulesExtra: 0,
  },
  setQrVersion: (version) => set((s) => ({ qr: { ...s.qr, version } })),
  setQrEcc: (ecc) => set((s) => ({ qr: { ...s.qr, ecc } })),
  setQrEncodingMode: (encodingMode) => set((s) => ({ qr: { ...s.qr, encodingMode } })),
  setQrMaskPattern: (maskPattern) => set((s) => ({ qr: { ...s.qr, maskPattern } })),
  setQrCharacterEncoding: (characterEncoding) =>
    set((s) => ({ qr: { ...s.qr, characterEncoding } })),
  setQrQuietZone: (quietZoneModules) => set((s) => ({ qr: { ...s.qr, quietZoneModules } })),
  setQrQuietZoneMinEnforce: (quietZoneMinEnforce) =>
    set((s) => ({ qr: { ...s.qr, quietZoneMinEnforce } })),

  // Render defaults
  render: {
    modulePx: 20,
    crispEdges: true,
    pixelSnap: 'floor',
    moduleGapPercent: 0,
    gapMode: 'none',
    moduleStyle: 'square',
    finderStyle: 'square',
    alignmentStyle: 'match_finder',
    timingStyle: 'match_module',
    cornerRadius: 0,
    dotRotationDeg: 0,
    eyeOuterStyle: 'square',
    eyeInnerStyle: 'square',
    eyeScale: 100,
    frameStyle: 'none',
    frameText: '',
    fgColor: '#000000',
    bgColor: '#ffffff',
    bgTransparent: false,
    palette: [],
    paletteMode: 'position',
    gradient: { type: 'none', stops: [] },
    perModuleColorMode: 'solid',
    contrastGuard: false,
    minContrastRatio: 4.5,
  },
  setRenderModulePx: (modulePx) => set((s) => ({ render: { ...s.render, modulePx } })),
  setRenderCrispEdges: (crispEdges) => set((s) => ({ render: { ...s.render, crispEdges } })),
  setRenderModuleGap: (moduleGapPercent) =>
    set((s) => ({ render: { ...s.render, moduleGapPercent } })),
  setRenderGapMode: (gapMode) => set((s) => ({ render: { ...s.render, gapMode } })),
  setRenderModuleStyle: (moduleStyle) => set((s) => ({ render: { ...s.render, moduleStyle } })),
  setRenderFinderStyle: (finderStyle) =>
    set((s) => ({
      render: { ...s.render, finderStyle, eyeOuterStyle: finderStyle, eyeInnerStyle: finderStyle },
    })),
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
    set((s) => ({ render: { ...s.render, gradient: { ...s.render.gradient, ...gradient } } })),

  _preArtworkQr: null,

  // Overlay defaults
  overlay: {
    enabled: false,
    file: null,
    url: '',
    type: 'static',
    framePick: 'all',
    cropEnabled: false,
    cropRegion: { x: 0.5, y: 0.5, size: 1 },
    fit: 'cover',
    rotateDeg: 0,
    flipX: false,
    flipY: false,
    colorMode: 'color',
    invert: false,
    brightness: 0,
    contrast: 0,
    gamma: 1,
    saturation: 0,
    hueRotateDeg: 0,
    blurPx: 0,
    sharpen: 0,
    posterizeLevels: 0,
    // 0 disables hard thresholding. Any positive value applies a binary threshold.
    threshold: 0,
    edgeDetect: 'off',
    mode: 'dithered',
    intensity: 50,
    preserveFinders: true,
    preserveTiming: true,
    preserveAlignment: true,
    protectFormatInfo: true,
    protectVersionInfo: true,
    subpixelGridSize: '3x3',
    subpixelCenterRule: 'strict',
    subpixelNeutralColor: '#808080',
    subpixelFinderOverride: 'solid',
    ditherKind: 'error_diffusion',
    ditherStrength: 50,
    finderDitherStrength: 65,
    blendPreservations: false,
    blendPreservationMode: 'overlay',
    ditherSerpentine: false,
    diffusionKernel: 'floyd_steinberg',
    orderedMatrix: 'bayer4',
    blueNoiseTileSize: 64,
    blueNoiseSeed: 0,
    colorDither: 'none',
    halftoneCell: 'per_module',
    halftoneDotShape: 'circle',
    duotoneColors: ['#000000', '#ffffff'],
    brightnessCurve: 'linear',
    eccAwareEnabled: false,
    eccAwareRiskBudget: 50,
    eccAwareWeightMap: 'distance_to_finders',
    gifUseFrameDelays: true,
    gifMaxFps: 30,
    gifDisposalHandling: 'respect',
    qrFirstMode: false,
    qrartIterations: 10000,
    qrartFragmentLength: 8,
    qrartSeed: 42,
  },
  setOverlayEnabled: (enabled) => set((s) => ({ overlay: { ...s.overlay, enabled } })),
  setOverlayFile: (file) =>
    set((s) => ({ overlay: { ...s.overlay, file, enabled: !!file || !!s.overlay.url } })),
  setOverlayUrl: (url) => set((s) => ({ overlay: { ...s.overlay, url } })),
  clearOverlay: () =>
    set((s) => ({ overlay: { ...s.overlay, file: null, url: '', enabled: false } })),
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
      const enteringArtwork = mode === 'artwork' && s.overlay.mode !== 'artwork';
      const leavingArtwork = mode !== 'artwork' && s.overlay.mode === 'artwork';

      if (enteringArtwork) {
        return {
          overlay: { ...s.overlay, mode },
          qr: { ...s.qr, ecc: 'L' as ECCLevel, version: 6 },
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

  // Animation defaults
  animation: {
    speedMs: 100,
    loop: true,
    bounce: false,
    playing: true,
    startFrame: 0,
    maxFrames: 0, // 0 = auto (use source frames, capped for performance)
    frameStep: 1,
    perFrameDelay: [],
    interpolate: 'none',
    temporalDither: 'off',
    seed: 0,
    pattern: 'none',
    target: 'result',
    waveAxis: 'y',
    pattern2: 'none',
    target2: 'result',
    waveAxis2: 'x',
    moduleJitterPx: 0,
    colorCycle: false,
  },
  setAnimationSpeedMs: (speedMs) => set((s) => ({ animation: { ...s.animation, speedMs } })),
  setAnimationLoop: (loop) => set((s) => ({ animation: { ...s.animation, loop } })),
  setAnimationBounce: (bounce) => set((s) => ({ animation: { ...s.animation, bounce } })),
  setAnimationPlaying: (playing) => set((s) => ({ animation: { ...s.animation, playing } })),
  setAnimationStartFrame: (startFrame) =>
    set((s) => ({ animation: { ...s.animation, startFrame } })),
  setAnimationMaxFrames: (maxFrames) => set((s) => ({ animation: { ...s.animation, maxFrames } })),
  setAnimationFrameStep: (frameStep) => set((s) => ({ animation: { ...s.animation, frameStep } })),

  // Output defaults
  output: {
    format: 'gif',
    widthPx: 400,
    heightPx: 400,
    quality: 0.9,
    filename: 'anqr-qrcode',
    includeQuietZone: true,
    dpi: 72,
    bgOverride: '',
    gifPaletteSize: 256,
    gifQuantizer: 'median_cut',
    gifDither: 'floyd',
    gifTransparentColor: '',
    gifDisposal: 'keep',
    svgTrueVector: false,
    svgShapePrecision: 'pixel',
    svgEmbedRasterOverlay: true,
    svgMetadata: {},
    formatExtra: 'none',
  },
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

  // Watermark defaults
  watermark: {
    enabled: false,
    kind: 'text',
    text: '',
    image: null,
    position: 'center',
    opacity: 50,
    blend: 'normal',
  },
  setWatermarkEnabled: (enabled) => set((s) => ({ watermark: { ...s.watermark, enabled } })),
  setWatermarkKind: (kind) => set((s) => ({ watermark: { ...s.watermark, kind } })),
  setWatermarkText: (text) => set((s) => ({ watermark: { ...s.watermark, text } })),
  setWatermarkPosition: (position) => set((s) => ({ watermark: { ...s.watermark, position } })),
  setWatermarkOpacity: (opacity) => set((s) => ({ watermark: { ...s.watermark, opacity } })),

  // Metadata defaults
  metadata: {
    title: '',
    author: '',
    copyright: '',
    license: '',
    description: '',
    creationTime: false,
    customKv: [],
  },
  setMetadata: (meta) => set((s) => ({ metadata: { ...s.metadata, ...meta } })),

  // Safety defaults
  safety: {
    mode: 'off',
    minModulePx: 2,
    minQuietZoneModules: 4,
    lockFinders: true,
    lockTiming: true,
    lockAlign: true,
    lockFormat: true,
    lockVersion: true,
    maxOverlayIntensityByEcc: { L: 30, M: 50, Q: 70, H: 85 },
  },
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
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Generate final payload text based on kind
  getPayloadText: () => {
    const { payload } = get();
    const serializer = PAYLOAD_SERIALIZERS[payload.kind];
    if (serializer) return serializer(payload);
    return applyPayloadTransforms(payload.text, payload);
  },
}));
