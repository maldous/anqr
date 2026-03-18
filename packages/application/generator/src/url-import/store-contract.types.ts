export type UrlImportTier = "basic" | "advanced" | "professional";

export type UrlImportPayloadKind =
  | "plain_text"
  | "url"
  | "tel"
  | "email"
  | "sms"
  | "geo"
  | "vcard"
  | "mecard"
  | "bizcard"
  | "wifi"
  | "app_link"
  | "event"
  | "event_rsvp"
  | "calendar_subscription"
  | "social_profile"
  | "messaging_link"
  | "epc_sepa"
  | "upi"
  | "paynow"
  | "promptpay"
  | "pix"
  | "crypto"
  | "swiss_qr_bill"
  | "lightning"
  | "ethereum_eip681"
  | "qris"
  | "duitnow"
  | "bharatqr"
  | "vietqr"
  | "qrph"
  | "twqr"
  | "hkqr"
  | "jpqr"
  | "auspaynet"
  | "paypal_me"
  | "cashapp"
  | "emv_generic"
  | "gs1_digital_link"
  | "short_link"
  | "utm_link"
  | "custom";

export type UrlImportEcc = "L" | "M" | "Q" | "H";
export type UrlImportEncodingMode = "auto" | "numeric" | "alphanumeric" | "byte" | "kanji";
export type UrlImportGapMode = "none" | "inset" | "stroke" | "negative_space";
export type UrlImportFrameStyle = "none" | "rounded_frame" | "sticker" | "tag";
export type UrlImportOverlayFit = "cover" | "contain" | "stretch";
export type UrlImportOverlayColorMode = "color" | "grayscale" | "bw";
export type UrlImportEdgeDetect = "off" | "sobel" | "canny";
export type UrlImportOutputFormat = "png" | "webp" | "gif" | "svg";
export type UrlImportGifQuantizer = "median_cut" | "neuquant" | "octree";

export interface UrlImportGradientUpdate {
  type: "none" | "linear" | "radial" | "conic";
  stops?: Array<{ pos: number; color: string }>;
  angle?: number;
}

export interface UrlImportStore {
  setTier: (tier: any) => void;
  setPayloadKind: (kind: any) => void;
  setPayloadText: (text: string) => void;
  setPayloadUrl: (url: { href?: string }) => void;
  setQrEcc: (ecc: any) => void;
  setQrVersion: (version: number) => void;
  setQrQuietZone: (margin: number) => void;
  setQrEncodingMode: (mode: any) => void;

  setRenderModulePx: (px: number) => void;
  setRenderFgColor: (color: string) => void;
  setRenderBgColor: (color: string) => void;
  setRenderBgTransparent: (transparent: boolean) => void;
  setRenderModuleStyle: (style: any) => void;
  setRenderFinderStyle: (style: any) => void;
  setRenderAlignmentStyle: (style: any) => void;
  setRenderTimingStyle: (style: any) => void;
  setRenderModuleGap: (percent: number) => void;
  setRenderGapMode: (mode: any) => void;
  setRenderCornerRadius: (radius: number) => void;
  setRenderGradient: (gradient: any) => void;
  setRenderFrameStyle: (style: any) => void;
  setRenderFrameText: (text: string) => void;

  setOverlayMode: (mode: any) => void;
  setOverlayIntensity: (intensity: number) => void;
  setOverlayFit: (fit: any) => void;
  setOverlayRotate: (rotation: number) => void;
  setOverlayFlip: (flip: { x?: boolean; y?: boolean }) => void;
  setOverlayPreserveFinders: (preserve: boolean) => void;
  setOverlayPreserveTiming: (preserve: boolean) => void;
  setOverlayPreserveAlignment: (preserve: boolean) => void;
  setOverlayColorMode: (mode: any) => void;
  setOverlayBrightness: (value: number) => void;
  setOverlayContrast: (value: number) => void;
  setOverlayGamma: (value: number) => void;
  setOverlaySaturation: (value: number) => void;
  setOverlayHueRotate: (value: number) => void;
  setOverlayBlur: (value: number) => void;
  setOverlaySharpen: (value: number) => void;
  setOverlayPosterize: (value: number) => void;
  setOverlayThreshold: (value: number) => void;
  setOverlayEdgeDetect: (value: any) => void;
  setOverlayInvert: (value: boolean) => void;
  setOverlayDitherKind: (kind: any) => void;
  setOverlayDiffusionKernel: (kernel: any) => void;
  setOverlayDitherStrength: (strength: number) => void;

  setAnimationSpeedMs: (speed: number) => void;
  setAnimationLoop: (loop: boolean) => void;
  setAnimationBounce: (bounce: boolean) => void;
  setAnimationStartFrame: (frame: number) => void;
  setAnimationMaxFrames: (frames: number) => void;
  setAnimationFrameStep: (step: number) => void;

  setOutputFormat: (format: any) => void;
  setOutputWidth: (width: number) => void;
  setOutputHeight: (height: number) => void;
  setOutputQuality: (quality: number) => void;
  setOutputFilename: (filename: string) => void;
  setOutputGifPaletteSize: (size: number) => void;
  setOutputGifQuantizer: (quantizer: any) => void;
}
