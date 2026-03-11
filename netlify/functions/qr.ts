// Initialize Sentry for error tracking (must be first import)
import * as Sentry from '@sentry/node';
// @ts-expect-error - JSON import resolved by esbuild at bundle time
import pkg from '../../package.json';

Sentry.init({
  dsn: 'https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824',
  sendDefaultPii: true,
  release: `anqr@${pkg.version}`,
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  environment: 'production',
});

/**
 * Netlify Function: QR Code Image Generator
 *
 * Generates QR code images server-side for embedding via <img> tags.
 * Uses the same QRGenerator as the main app with a Node.js canvas factory.
 * Supports PNG, WebP, GIF output with watermarks and metadata embedding.
 *
 * Module Dependencies:
 * - @/modules/animation: Animation patterns and easing functions
 * - @/modules/qr-generator: QRGenerator class for QR code rendering
 *
 * Type Alignment:
 * - ECCLevel, DitherKind, OutputFormat: align with @/modules/qr-spec, @/modules/overlay, @/modules/exporter
 * - AnimationPattern, AnimationEasing: imported from @/modules/animation
 * - Watermark types: local implementation (server-side only)
 *
 * Parameter Support:
 * All parameters are fully supported server-side unless marked [CLIENT-ONLY].
 *
 * [CLIENT-ONLY] Parameters (require interactive/browser features):
 * - QA simulation: qaContrast, qaBlur, qaNoise, qaHeatmap (require scan validation)
 * - Auto-reduce: autoReduce (requires iterative scan testing)
 * - Module jitter: jitter (requires per-frame QR regeneration with randomness)
 *
 * Usage: GET /api/qr?data=https://example.com&size=200&fg=000000&bg=ffffff
 *
 * Parameters:
 *
 * === CORE QR SETTINGS ===
 * - data: The content to encode (required)
 * - size: Output image size in pixels (default: 400, max: 1024)
 * - modulePx: Module pixel size (default: auto-calculated from size)
 * - w: Output width in pixels (max: 1024, overrides size)
 * - h: Output height in pixels (max: 1024, overrides size)
 * - ec: Error correction level L/M/Q/H (default: H)
 * - v: QR version 1-40 (default: 0 = auto)
 * - enc: Encoding mode - auto/numeric/alphanumeric/byte/kanji (default: auto)
 * - mask: Mask pattern - auto/0-7 (default: auto)
 * - charset: Character encoding - default/utf8/shift-jis (default: default)
 * - margin: Quiet zone modules (default: 4)
 * - border: Extra border modules (default: 0)
 *
 * === OUTPUT FORMAT ===
 * - format: Output format - png/webp/gif (default: gif)
 * - quality: Output quality 0-1 for webp (default: 0.9)
 * - webpQ: WebP quality 0-100 (default: 90)
 * - gifColors: GIF palette size 2-256 (default: 256)
 * - dpi: Output DPI for PNG (default: 72)
 * - fname: Output filename (default: anqr-qrcode)
 * - inclQz: Include quiet zone in output 0/1 (default: 1)
 * - bgOver: Background color override hex (without #)
 * - fmtExtra: Extra format output - none/eps/animated_webp (default: none)
 * - svgPrec: SVG shape precision - pixel/precise
 * - svgEmbed: Embed raster overlay in SVG 0/1
 *
 * === COLORS ===
 * - fg: Foreground color hex without # (default: 000000)
 * - bg: Background color hex without # (default: ffffff)
 * - transparent: Set to 1 for transparent background
 *
 * === MODULE STYLING ===
 * - style: Module style - square/rounded/dots/diamond/connected (default: square)
 * - finder: Finder style - square/rounded/circle (default: square)
 * - align: Alignment pattern style - match_finder/square/rounded/circle (default: match_finder)
 * - timing: Timing pattern style - match_module/solid/dashed (default: match_module)
 * - eyeOuter: Eye outer style - square/rounded/circle
 * - eyeInner: Eye inner style - square/rounded/circle
 * - eyeScale: Eye scale percentage (default: 100)
 * - radius: Corner radius percentage 0-100 (default: 0)
 * - gap: Module gap percentage (default: 0)
 * - gapMode: Gap mode - none/inset/stroke/negative_space
 * - crisp: Crisp edges 0/1 (default: 1)
 * - snap: Pixel snap - floor/round/ceil (default: floor)
 * - dotRot: Dot rotation degrees (default: 0)
 *
 * === FRAME ===
 * - frame: Frame style - none/rounded_frame/sticker/tag
 * - frameText: Text to show in frame
 *
 * === GRADIENT ===
 * - grad: Gradient type - none/linear/radial/conic
 * - gradAngle: Gradient angle for linear (default: 0)
 * - gradStops: Gradient stops as color1,pos1,color2,pos2,...
 *
 * === PER-MODULE COLOR ===
 * - modColor: Per-module color mode - solid/by_brightness/by_position/by_overlay/by_cluster
 * - cGuard: Contrast guard 0/1 (default: 0)
 * - minContrast: Minimum contrast ratio (default: 4.5)
 * - palette: Color palette as comma-separated hex values
 * - paletteMode: Palette color mode - position/brightness/diagonal/radial/random/row/column
 *
 * === OVERLAY IMAGE ===
 * - img: URL to overlay image (fetched server-side)
 * - mode: Overlay mode - center/halftone/blend/brightness/mosaic/dithered/blue-noise/subpixel
 * - intensity: Overlay intensity 0-100 (default: 100)
 * - colorMode: Overlay color mode - color/grayscale/bw
 * - logoSize: Logo size percentage for center mode (default: 25)
 * - fit: Overlay fit mode - cover/contain/stretch (default: cover)
 * - rot: Overlay rotation in degrees (default: 0)
 * - flipX: Flip overlay horizontally (default: 0)
 * - flipY: Flip overlay vertically (default: 0)
 *
 * === OVERLAY FILTERS ===
 * - brightness: Overlay brightness adjustment -100 to 100 (default: 0)
 * - contrast: Overlay contrast adjustment -100 to 100 (default: 0)
 * - gamma: Overlay gamma 0.1 to 3 (default: 1)
 * - saturation: Overlay saturation -100 to 100 (default: 0)
 * - hue: Overlay hue rotation in degrees (default: 0)
 * - invert: Invert overlay colors (default: 0)
 * - blur: Overlay blur radius in pixels (box blur via convolution)
 * - sharpen: Overlay sharpen amount 0-100 (convolution kernel)
 * - posterize: Overlay posterize levels 2-256 (color reduction)
 * - threshold: Overlay threshold 0-255 (binary threshold)
 * - edge: Edge detection - off/sobel/canny (Sobel/Canny edge detection)
 *
 * === OVERLAY CROP ===
 * - cropEn: Enable overlay cropping 0/1 (default: 0)
 * - cropX: Crop center X 0-1 (default: 0.5)
 * - cropY: Crop center Y 0-1 (default: 0.5)
 * - cropSize: Crop size 0-1 (default: 1)
 *
 * === OVERLAY TYPE ===
 * - ovType: Overlay type - static/gif/apng/webp_anim/video (default: static)
 * - ovFramePick: Overlay frame picking - all/every_n/max_frames/duration_limit (default: all)
 * - gifDelays: Use original GIF frame delays 0/1 (default: 1)
 * - gifDispH: GIF disposal handling - respect/simplify (default: respect)
 *
 * === PATTERN PRESERVATION ===
 * - keepFinders: Preserve finder patterns (default: 1)
 * - keepTiming: Preserve timing patterns (default: 0)
 * - keepAlign: Preserve alignment patterns (default: 0)
 * - protectFmt: Protect format info (default: 0)
 * - protectVer: Protect version info (default: 0)
 *
 * === ECC-AWARE MODE ===
 * - eccAware: ECC-aware mode (default: 0)
 * - eccRisk: ECC risk budget 0-100 (default: 50)
 * - eccMap: ECC weight map - distance_to_finders/block_heatmap/empirical_scan_heatmap
 *
 * === DITHERING ===
 * - ditherKind: Dither algorithm (default: ordered_bayer for performance)
 * - diffusionKernel: Diffusion kernel - floyd_steinberg/jarvis_judice_ninke/stucki/etc
 * - ditherStrength: Dither strength 0-100 (default: 50)
 * - finderDither: Finder/alignment boost strength 0-100 (default: 65)
 * - blendPres: Blend preservation overlays with sampled image colors 0/1 (default: 0)
 * - blendPresMode: Blend preservation style - overlay/dither (default: overlay)
 * - serpentine: Serpentine dithering 0/1 (default: 0)
 * - matrix: Ordered dither matrix - bayer2/bayer4/bayer8/etc
 * - bnTile: Blue noise tile size (default: 64)
 * - bnSeed: Blue noise seed (default: 0)
 * - colorDither: Color dither - none/per_channel/perceptual
 *
 * === SUBPIXEL ===
 * - spGrid: Subpixel grid size - 2x2/3x3/4x4
 * - spCenter: Subpixel center rule - strict/halftone_center
 * - spNeutral: Subpixel neutral color hex (default: 808080)
 * - spFinder: Subpixel finder override - solid/stylized
 *
 * === HALFTONE ===
 * - htCell: Halftone cell - per_module/n×n
 * - htDot: Halftone dot shape - circle/square/line
 * - htCurve: Brightness curve - linear/s-curve/gamma
 * - duo1: Duotone color 1 hex (default: 000000)
 * - duo2: Duotone color 2 hex (default: ffffff)
 *
 * === WATERMARK ===
 * - wmEn: Watermark enabled 0/1 (default: 0)
 * - wmKind: Watermark kind - text/image/pattern (default: text)
 * - wmText: Watermark text (URL encoded)
 * - wmPos: Watermark position - center/corners/edges/behind/quiet_zone (default: center)
 * - wmOpacity: Watermark opacity 0-100 (default: 50)
 * - wmBlend: Watermark blend - normal/multiply/screen/overlay (default: normal)
 * - wmImg: URL to watermark image (for image/pattern watermark types)
 *
 * === ANIMATION ===
 * - animPattern: Animation pattern for GIF - none/pulse/wave/scanline/shimmer/drift/color_cycle
 * - animFrames: Number of animation frames 1-60 (default: 24)
 * - animSpeed: Animation frame delay in ms 10-1000 (default: 100)
 * - animSeed: Animation random seed (default: 0)
 * - easing: Animation easing function - linear/ease_in/ease_out/ease_in_out/bounce
 * - animTarget: Apply animation to result/modules/both (default: result)
 * - animWaveAxis: Wave direction for wave pattern - x/y/xy (default: y)
 * - animPattern2: Secondary stacked animation pattern (default: none)
 * - animSeed2: Secondary animation seed (default: animSeed+911)
 * - easing2: Secondary animation easing (default: easing)
 * - animTarget2: Secondary target - result/modules/both (default: animTarget)
 * - animWaveAxis2: Secondary wave direction - x/y/xy (default: x when primary is y)
 * - colorCycle2: Secondary color cycle animation 0/1 (default: 0)
 * - reverse2: Secondary reverse animation 0/1 (default: reverse)
 * - bounce2: Secondary bounce animation 0/1 (default: bounce)
 * - loop: Animation loop 0/1 (default: 1)
 * - bounce: Animation bounce 0/1 (default: 0)
 * - reverse: Animation reverse 0/1 (default: 0)
 * - colorCycle: Color cycle animation 0/1 (default: 0)
 * - interp: Animation interpolation - none/crossfade/morph (default: none)
 * - tempDither: Temporal dithering - off/blue_noise/flicker_safe (default: off)
 * - startF: Animation start frame (default: 0)
 * - maxF: Animation max frames (default: 0 = auto)
 * - stepF: Animation frame step (default: 1)
 * - jitter: [CLIENT-ONLY] Module jitter in pixels - requires per-frame QR regeneration
 *
 * === METADATA ===
 * - metaTitle: PNG metadata title
 * - metaAuthor: PNG metadata author
 * - metaCopy: PNG metadata copyright
 * - metaDesc: PNG metadata description
 * - metaLic: PNG metadata license
 * - metaTime: Include creation time in metadata 0/1 (default: 0)
 * - metaKv: Custom metadata key-value pairs
 *
 * === SAFETY LOCKS ===
 * - lockF: Lock finder patterns 0/1 (default: 1)
 * - lockT: Lock timing patterns 0/1 (default: 1)
 * - lockA: Lock alignment patterns 0/1 (default: 1)
 * - lockFmt: Lock format info 0/1 (default: 1)
 * - lockV: Lock version info 0/1 (default: 1)
 * - safeMode: Safety mode - off/balanced/strict (default: off)
 * - safeMinPx: Minimum module size in pixels (default: 2)
 * - safeMinQz: Minimum quiet zone modules (default: 4)
 *
 * === AUTO-TUNING ===
 * - autoVer: Auto-pick QR version 0/1 (default: 1)
 * - autoEcc: Auto-pick ECC level 0/1 (default: 0) - hint only, no iterative testing
 * - autoReduce: [CLIENT-ONLY] Auto-reduce intensity until scannable - requires scan validation loop
 *
 * === QA SIMULATION (CLIENT-ONLY) ===
 * - qaContrast: [CLIENT-ONLY] Enable contrast check 0/1 - requires interactive validation
 * - qaBlur: [CLIENT-ONLY] Simulate blur in pixels - for interactive testing only
 * - qaNoise: [CLIENT-ONLY] Simulate noise level - for interactive testing only
 * - qaHeatmap: [CLIENT-ONLY] Show readability heatmap 0/1 - requires canvas overlay UI
 *
 * === PER-ECC INTENSITY LIMITS ===
 * - maxIntL: Max overlay intensity for ECC L (default: 100)
 * - maxIntM: Max overlay intensity for ECC M (default: 100)
 * - maxIntQ: Max overlay intensity for ECC Q (default: 100)
 * - maxIntH: Max overlay intensity for ECC H (default: 100)
 */

import { createHash } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Canvas,
  createCanvas,
  loadImage,
  ImageData as NapiImageData,
  type SKRSContext2D,
} from '@napi-rs/canvas';
import { getStore } from '@netlify/blobs';

// Polyfill ImageData globally for shared modules that use `new ImageData()`
if (globalThis.ImageData === undefined) {
  (globalThis as Record<string, unknown>).ImageData = NapiImageData;
}
if ((globalThis as Record<string, unknown>).HTMLCanvasElement === undefined) {
  (globalThis as Record<string, unknown>).HTMLCanvasElement = createCanvas(1, 1).constructor;
}
if ((globalThis as Record<string, unknown>).OffscreenCanvas === undefined) {
  (globalThis as Record<string, unknown>).OffscreenCanvas = (
    globalThis as Record<string, unknown>
  ).HTMLCanvasElement;
}

// Import animation utilities
import {
  type AnimationEasing,
  type AnimationPattern,
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationEasing,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
  applyAnimationWave,
  createGifEncoder,
  decodeGif,
  indexGifPixels,
  isGifEncodingAvailable,
  isGifSignature,
  quantizeGifPalette,
} from '../../src/modules/animation';
import { withGifEncodeLock as withSharedGifEncodeLock } from '../../src/modules/animation/gif-lock';
import { generateFullQArt, generateFullQArtOptimal } from '../../src/modules/qr-art';
import { calculateOptimalVersion } from '../../src/modules/qr-encoder/encoder-api';
// @ts-expect-error - JS module
import { QRGenerator } from '../../src/modules/qr-generator';

// Type alignment: This function's URL parameters align with ShareConfig from
// src/modules/share-links/types.ts - see that file for the complete type definition.
// The parseUrlParamsFromSearchParams() function can be used for shared parsing.

type ECCLevel = 'L' | 'M' | 'Q' | 'H';
type OutputFormat = 'png' | 'webp' | 'gif';
type WatermarkKind = 'text' | 'image' | 'pattern';
type WatermarkPosition = 'center' | 'corners' | 'edges' | 'behind' | 'quiet_zone';
type WatermarkBlend = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
type AnimationInterpolation = 'none' | 'crossfade' | 'morph';
type AnimationTemporalDitherMode = 'off' | 'blue_noise' | 'flicker_safe';
type AnimationTarget = 'result' | 'modules' | 'both';
type AnimationWaveAxis = 'x' | 'y' | 'xy';
type AnimationEffectConfig = {
  pattern: AnimationPattern;
  seed: number;
  easing: AnimationEasing;
  colorCycle: boolean;
  reverse: boolean;
  bounce: boolean;
  target: AnimationTarget;
  waveAxis: AnimationWaveAxis;
};
type DitherKind =
  | 'error_diffusion'
  | 'ordered_bayer'
  | 'ordered_clustered'
  | 'ordered_void_cluster'
  | 'blue_noise_threshold'
  | 'true_dither'
  | 'blue_noise'
  | 'white_noise'
  | 'gaussian_noise'
  | 'triangular_noise'
  | 'blue_noise_error_diffusion'
  | 'screened_blue_noise'
  | 'perceptual'
  | 'edge_aware'
  | 'adaptive_threshold'
  | 'temporal_blue_noise';

// ============================================
// SERVER-SIDE OPTIMIZATIONS & SECURITY
// ============================================

// Maximum image size for server-side processing (prevents excessive CPU usage)
const MAX_SERVER_IMAGE_SIZE = 2048;

// Maximum data payload length (prevents abuse)
const MAX_DATA_LENGTH = 4096;

// Maximum overlay image size in bytes (5MB)
const MAX_OVERLAY_BYTES = 5 * 1024 * 1024;

// Maximum decoded overlay pixel count (10 megapixels)
const MAX_OVERLAY_PIXELS = 10 * 1024 * 1024;

// Maximum GIF frames and duration
const MAX_GIF_FRAMES = 64;
const MAX_GIF_DURATION_MS = 10000;

// Server-side animation optimization: hard limit frames for animated overlays
// to prevent timeout issues. Client can handle more frames with compositor.
const SERVER_MAX_ANIMATION_FRAMES = 64;
const MAX_OVERLAY_REDIRECTS = 5;
const OVERLAY_HOST_LOOKUP_TTL_MS = 60_000;
const OVERLAY_HOST_LOOKUP_NEGATIVE_TTL_MS = 10_000;
const overlayHostnameSafetyCache = new Map<string, { isPrivate: boolean; expiresAt: number }>();

function _clearOverlayHostnameSafetyCache(): void {
  overlayHostnameSafetyCache.clear();
}

// Yield helper for long-running operations
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch timeout in milliseconds (allow override for slower remote environments)
const FETCH_TIMEOUT_MS = Math.max(
  1000,
  Number.parseInt(process.env.ANQR_OVERLAY_FETCH_TIMEOUT_MS || '60000', 10)
);

// Default dither algorithm for server-side when none specified (fast)
const DEFAULT_SERVER_DITHER: DitherKind = 'ordered_bayer';

// Default output format - align with client default (GIF) for consistency
const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'gif';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Keep runtime logs minimal by default for gallery/parity runs.
const QR_FN_DIAGNOSTICS = process.env.ANQR_QR_FN_DIAGNOSTICS === '1';
function qrFnLog(...args: unknown[]): void {
  if (QR_FN_DIAGNOSTICS) {
    console.log(...args);
  }
}

// ============================================
// BLOB CACHE
// ============================================

const QR_CACHE_STORE = 'qr-cache';
const NON_CACHE_PARAMS = new Set(['_cb', 'lang', '_fullRender', '_strictOverlay']);
const SENTINEL_PREFIX = 'rendering:';
const SENTINEL_TTL_MS = 600_000;
// Primary Netlify site for this repo (used when SITE_ID is not exported locally).
const DEFAULT_NETLIFY_SITE_ID = '7def13e4-9486-4e9a-9ad3-87abff74ef1d';
const IS_TEST_RUNTIME = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
let blobStoreDisabled = false;
let blobStoreDisabledLogged = false;

function computeCacheKey(params: URLSearchParams): string {
  const entries = [...params.entries()]
    .filter(([k]) => !NON_CACHE_PARAMS.has(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return createHash('sha256').update(new URLSearchParams(entries).toString()).digest('hex');
}

function isMissingBlobsEnvironmentError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeErr = error as { name?: string; message?: string };
  return (
    maybeErr.name === 'MissingBlobsEnvironmentError' ||
    String(maybeErr.message || '').includes(
      'The environment has not been configured to use Netlify Blobs'
    )
  );
}

function markBlobStoreDisabled(reason: string): void {
  blobStoreDisabled = true;
  if (blobStoreDisabledLogged) return;
  blobStoreDisabledLogged = true;
  qrFnLog('[BLOB] cache disabled', { reason });
}

function getBlobStoreOrNull() {
  if (IS_TEST_RUNTIME) return null;
  if (blobStoreDisabled) return null;
  try {
    const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
    const siteID =
      process.env.SITE_ID ||
      process.env.NETLIFY_SITE_ID ||
      (token ? DEFAULT_NETLIFY_SITE_ID : undefined);
    if (siteID && token) {
      // Explicit credentials avoid expired context tokens in some runtimes.
      return getStore({ name: QR_CACHE_STORE, siteID, token });
    }
    return getStore(QR_CACHE_STORE);
  } catch (error) {
    if (isMissingBlobsEnvironmentError(error)) {
      markBlobStoreDisabled('missing_blob_env');
      return null;
    }
    throw error;
  }
}

function isPrivateIPv4FirstOctet(a: number): boolean {
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  return false;
}

function isPrivateIPv4Class192(b: number, c: number): boolean {
  if (b === 168) return true;
  if (b === 0 && c === 0) return true;
  if (b === 0 && c === 2) return true;
  return false;
}

function isPrivateIPv4Subnet(a: number, b: number, c: number): boolean {
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192) return isPrivateIPv4Class192(b, c);
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  return false;
}

function isPrivateIPv4(a: number, b: number, c: number): boolean {
  return isPrivateIPv4FirstOctet(a) || isPrivateIPv4Subnet(a, b, c);
}

function isReservedIPv6(ip: string): boolean {
  return (
    ip.startsWith('fe80:') ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip === '::1' ||
    ip.startsWith('::ffff:')
  );
}

function isPrivateOrReservedIP(ip: string): boolean {
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
    return true;
  }

  const ipv4Match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number);
    return isPrivateIPv4(a, b, c);
  }

  return isReservedIPv6(ip);
}

/**
 * Resolve hostname and check if it points to a private IP (DNS rebinding protection)
 * This prevents SSRF via DNS resolution to internal IPs
 */
async function _isPrivateHostname(hostname: string): Promise<boolean> {
  let normalizedHostname = String(hostname || '')
    .trim()
    .toLowerCase();
  while (normalizedHostname.endsWith('.')) normalizedHostname = normalizedHostname.slice(0, -1);

  if (!normalizedHostname) {
    return true;
  }

  // First check if it's already a literal IP
  if (isPrivateOrReservedIP(normalizedHostname)) {
    return true;
  }

  // Check for common bypass patterns
  if (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.local') ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname.endsWith('.internal') ||
    normalizedHostname.includes('127.0.0.1') ||
    normalizedHostname.includes('0.0.0.0')
  ) {
    return true;
  }

  // Keep tests deterministic and offline-friendly while preserving heuristic checks.
  if (IS_TEST_RUNTIME) {
    return false;
  }

  const now = Date.now();
  const cached = overlayHostnameSafetyCache.get(normalizedHostname);
  if (cached && cached.expiresAt > now) {
    return cached.isPrivate;
  }

  try {
    const resolved = await dnsLookup(normalizedHostname, { all: true, verbatim: true });
    const isPrivate =
      resolved.length === 0 || resolved.some((entry) => isPrivateOrReservedIP(entry.address));
    overlayHostnameSafetyCache.set(normalizedHostname, {
      isPrivate,
      expiresAt: now + OVERLAY_HOST_LOOKUP_TTL_MS,
    });
    return isPrivate;
  } catch {
    // Fail closed when DNS lookup fails.
    overlayHostnameSafetyCache.set(normalizedHostname, {
      isPrivate: true,
      expiresAt: now + OVERLAY_HOST_LOOKUP_NEGATIVE_TTL_MS,
    });
    return true;
  }
}

/**
 * Node.js canvas factory using @napi-rs/canvas
 */
const nodeCanvasFactory = {
  createCanvas: async (width: number, height: number) => {
    return createCanvas(width, height);
  },
  loadImage: async (src: string | Buffer | URL | ArrayBuffer) => {
    return loadImage(src);
  },
};

// ============================================
// WATERMARK FUNCTIONS (server-side adaptation)
// ============================================

/**
 * Create a text watermark canvas (server-side)
 */
function createTextWatermark(
  text: string,
  fontSize: number = 14,
  fontFamily: string = 'sans-serif',
  color: string = '#000000'
): Canvas {
  // First measure the text
  const measureCanvas = createCanvas(1, 1);
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  const metrics = measureCtx.measureText(text);
  const textHeight = fontSize * 1.2;

  const canvas = createCanvas(Math.ceil(metrics.width) + 10, Math.ceil(textHeight) + 10);
  const ctx = canvas.getContext('2d');

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 5, canvas.height / 2);

  return canvas;
}

/**
 * Get watermark positions based on position type
 */
function getWatermarkPositions(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  margin: number = 10
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  switch (position) {
    case 'center':
      positions.push({
        x: (canvasWidth - watermarkWidth) / 2,
        y: (canvasHeight - watermarkHeight) / 2,
      });
      break;

    case 'corners':
      positions.push(
        { x: margin, y: margin },
        { x: canvasWidth - watermarkWidth - margin, y: margin },
        { x: margin, y: canvasHeight - watermarkHeight - margin },
        { x: canvasWidth - watermarkWidth - margin, y: canvasHeight - watermarkHeight - margin }
      );
      break;

    case 'edges':
      positions.push(
        { x: (canvasWidth - watermarkWidth) / 2, y: margin },
        { x: (canvasWidth - watermarkWidth) / 2, y: canvasHeight - watermarkHeight - margin },
        { x: margin, y: (canvasHeight - watermarkHeight) / 2 },
        { x: canvasWidth - watermarkWidth - margin, y: (canvasHeight - watermarkHeight) / 2 }
      );
      break;

    case 'quiet_zone':
      positions.push({ x: margin / 2, y: canvasHeight - watermarkHeight - margin / 2 });
      break;
    // default case intentionally falls through to 'center' behavior
  }

  return positions;
}

/**
 * Apply blend mode to context
 */
function applyBlendMode(ctx: SKRSContext2D, blend: WatermarkBlend): void {
  switch (blend) {
    case 'multiply':
      ctx.globalCompositeOperation = 'multiply';
      break;
    case 'screen':
      ctx.globalCompositeOperation = 'screen';
      break;
    case 'overlay':
      ctx.globalCompositeOperation = 'overlay';
      break;
    case 'soft-light':
      ctx.globalCompositeOperation = 'soft-light';
      break;
    default:
      ctx.globalCompositeOperation = 'source-over';
      break;
  }
}

interface WatermarkOptions {
  enabled: boolean;
  kind: WatermarkKind;
  text: string;
  imageCanvas?: Canvas | null;
  position: WatermarkPosition;
  opacity: number;
  blend: WatermarkBlend;
}

/**
 * Apply watermark to a canvas (server-side)
 */
function applyWatermarkServer(source: Canvas, options: WatermarkOptions): Canvas {
  if (!options.enabled || (options.kind === 'text' && !options.text)) {
    return source;
  }

  const result = createCanvas(source.width, source.height);
  const ctx = result.getContext('2d');

  // For 'behind' position, draw watermark first
  if (options.position === 'behind') {
    drawWatermarkLayerServer(ctx, options, source.width, source.height);
    ctx.drawImage(source, 0, 0);
  } else {
    ctx.drawImage(source, 0, 0);
    drawWatermarkLayerServer(ctx, options, source.width, source.height);
  }

  return result;
}

/**
 * Draw watermark layer (server-side)
 */
function drawWatermarkLayerServer(
  ctx: SKRSContext2D,
  options: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number
): void {
  let watermarkCanvas: Canvas | null = null;

  if (options.kind === 'text' && options.text) {
    watermarkCanvas = createTextWatermark(options.text, 14, 'sans-serif', '#000000');
  } else if ((options.kind === 'image' || options.kind === 'pattern') && options.imageCanvas) {
    watermarkCanvas = options.imageCanvas;
  }

  if (!watermarkCanvas) return;

  ctx.save();
  applyBlendMode(ctx, options.blend);
  ctx.globalAlpha = options.opacity / 100;

  const positions = getWatermarkPositions(
    options.position,
    canvasWidth,
    canvasHeight,
    watermarkCanvas.width,
    watermarkCanvas.height,
    10
  );

  for (const pos of positions) {
    ctx.drawImage(watermarkCanvas, pos.x, pos.y);
  }

  ctx.restore();
}

// ============================================
// PNG METADATA EMBEDDING
// ============================================

interface PngMetadata {
  title?: string;
  author?: string;
  description?: string;
  copyright?: string;
  creationTime?: string;
  software?: string;
}

/**
 * CRC32 calculation for PNG chunks
 */
function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }

  for (const byte of data) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Create a PNG tEXt chunk for metadata
 */
function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  chunkData.set(keywordBytes, 0);
  chunkData.set([0], keywordBytes.length);
  chunkData.set(textBytes, keywordBytes.length + 1);

  const chunkType = new TextEncoder().encode('tEXt');
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);

  const dataView = new DataView(chunk.buffer);
  dataView.setUint32(0, chunkData.length, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);

  const crcData = new Uint8Array(4 + chunkData.length);
  crcData.set(chunkType, 0);
  crcData.set(chunkData, 4);
  const crc = calculateCrc32(crcData);
  dataView.setUint32(8 + chunkData.length, crc, false);

  return chunk;
}

/**
 * Create PNG pHYs chunk for DPI
 */
function createPngPhysChunk(dpi: number): Uint8Array {
  const pixelsPerMeter = Math.round(dpi / 0.0254);

  const chunkData = new Uint8Array(9);
  const chunkDataView = new DataView(chunkData.buffer);
  chunkDataView.setUint32(0, pixelsPerMeter, false);
  chunkDataView.setUint32(4, pixelsPerMeter, false);
  chunkData[8] = 1;

  const chunkType = new TextEncoder().encode('pHYs');
  const chunk = new Uint8Array(4 + 4 + 9 + 4);
  const chunkView = new DataView(chunk.buffer);

  chunkView.setUint32(0, 9, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);

  const crcData = new Uint8Array(4 + 9);
  crcData.set(chunkType, 0);
  crcData.set(chunkData, 4);
  const crc = calculateCrc32(crcData);
  chunkView.setUint32(17, crc, false);

  return chunk;
}

/**
 * Embed metadata and DPI into PNG buffer
 */
function embedPngMetadataAndDpi(pngBuffer: Buffer, metadata?: PngMetadata, dpi?: number): Buffer {
  const data = new Uint8Array(pngBuffer);

  // Verify PNG signature
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (data[i] !== pngSignature[i]) {
      return pngBuffer;
    }
  }

  const chunks: Uint8Array[] = [];

  // Add DPI chunk after IHDR (position 33)
  if (dpi && dpi > 0 && dpi !== 72) {
    chunks.push(createPngPhysChunk(dpi));
  }

  // Add metadata chunks
  if (metadata) {
    const keywordMap: Record<string, string> = {
      title: 'Title',
      author: 'Author',
      description: 'Description',
      copyright: 'Copyright',
      creationTime: 'Creation Time',
      software: 'Software',
    };

    for (const [key, value] of Object.entries(metadata)) {
      if (value && typeof value === 'string') {
        const keyword = keywordMap[key] || key;
        chunks.push(createPngTextChunk(keyword, value));
      }
    }
  }

  if (chunks.length === 0) {
    return pngBuffer;
  }

  // Insert chunks after IHDR (at position 33)
  const ihdrEnd = 33;
  const totalChunksSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);

  const newPng = new Uint8Array(data.length + totalChunksSize);
  newPng.set(data.slice(0, ihdrEnd), 0);

  let offset = ihdrEnd;
  for (const chunk of chunks) {
    newPng.set(chunk, offset);
    offset += chunk.length;
  }

  newPng.set(data.slice(ihdrEnd), offset);

  return Buffer.from(newPng);
}

// ============================================
// GIF ENCODING
// ============================================

async function withGifEncodeLock<T>(fn: () => T | Promise<T>): Promise<T> {
  return withSharedGifEncodeLock(fn, {
    onWait: (waitMs, queueDepth) => {
      if (waitMs > 10) {
        qrFnLog('[TIMING] GIF encode queue wait', {
          waitMs,
          queueDepth,
        });
      }
    },
  });
}

function parseGifBackgroundColor(backgroundColor: string): [number, number, number] {
  const normalized = String(backgroundColor || '#ffffff')
    .trim()
    .replace(/^#/, '');

  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    const r = normalized[0] + normalized[0];
    const g = normalized[1] + normalized[1];
    const b = normalized[2] + normalized[2];
    return [Number.parseInt(r, 16), Number.parseInt(g, 16), Number.parseInt(b, 16)];
  }

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ];
  }

  return [255, 255, 255];
}

function prepareGifFramePixels(
  rgba: Uint8ClampedArray,
  bgRgb: [number, number, number],
  preserveTransparency: boolean
): Uint8ClampedArray {
  // Always copy incoming frame data so no caller can hold a mutable live ImageData view.
  const frame = new Uint8ClampedArray(rgba);

  if (preserveTransparency) {
    return frame;
  }

  let hasTransparency = false;
  for (let i = 3; i < frame.length; i += 4) {
    if (frame[i] !== 255) {
      hasTransparency = true;
      break;
    }
  }
  if (!hasTransparency) {
    return frame;
  }

  const [bgR, bgG, bgB] = bgRgb;
  const flattened = new Uint8ClampedArray(frame.length);
  for (let i = 0; i < frame.length; i += 4) {
    const a = frame[i + 3];
    if (a <= 0) {
      flattened[i] = bgR;
      flattened[i + 1] = bgG;
      flattened[i + 2] = bgB;
      flattened[i + 3] = 255;
      continue;
    }
    if (a >= 255) {
      flattened[i] = frame[i];
      flattened[i + 1] = frame[i + 1];
      flattened[i + 2] = frame[i + 2];
      flattened[i + 3] = 255;
      continue;
    }

    const alpha = a / 255;
    const invAlpha = 1 - alpha;
    flattened[i] = Math.round(frame[i] * alpha + bgR * invAlpha);
    flattened[i + 1] = Math.round(frame[i + 1] * alpha + bgG * invAlpha);
    flattened[i + 2] = Math.round(frame[i + 2] * alpha + bgB * invAlpha);
    flattened[i + 3] = 255;
  }

  return flattened;
}

function hasPaletteColor(
  palette: number[][],
  predicate: (r: number, g: number, b: number) => boolean
): boolean {
  return palette.some((entry) => {
    const [r, g, b] = entry;
    return predicate(r ?? 0, g ?? 0, b ?? 0);
  });
}

function ensureGifPaletteAnchors(palette: number[][], maxSize: number): number[][] {
  const out = [...palette];
  const hasNearBlack = hasPaletteColor(out, (r, g, b) => r <= 24 && g <= 24 && b <= 24);
  const hasNearWhite = hasPaletteColor(out, (r, g, b) => r >= 231 && g >= 231 && b >= 231);

  if (!hasNearBlack) {
    out.push([0, 0, 0]);
  }
  if (!hasNearWhite) {
    out.push([255, 255, 255]);
  }

  // Trim back to the requested palette size while keeping anchor colors.
  while (out.length > maxSize) {
    const dropIdx = Math.floor(out.length / 2);
    out.splice(dropIdx, 1);
  }

  return out;
}

function buildGlobalGifPalette(
  frameDataProvider: (frameIndex: number) => Uint8ClampedArray,
  frameCount: number,
  width: number,
  height: number,
  paletteSize: number
): number[][] {
  if (frameCount <= 0) {
    return ensureGifPaletteAnchors(
      [
        [0, 0, 0],
        [255, 255, 255],
      ],
      paletteSize
    );
  }

  const indices =
    frameCount > 10
      ? [0, Math.floor(frameCount / 2), frameCount - 1]
      : Array.from({ length: frameCount }, (_, i) => i);
  const maxSamplePixels = 180_000;
  const totalPixels = Math.max(1, indices.length * width * height);
  const stride = Math.max(1, Math.floor(Math.sqrt(totalPixels / maxSamplePixels)));
  const sampledWidth = Math.max(1, Math.ceil(width / stride));
  const sampledHeight = Math.max(1, Math.ceil(height / stride));
  const samplePixels = new Uint8ClampedArray(indices.length * sampledWidth * sampledHeight * 4);
  let offset = 0;

  for (const idx of indices) {
    const data = frameDataProvider(idx);
    if (stride === 1) {
      samplePixels.set(data, offset);
      offset += data.length;
      continue;
    }

    for (let y = 0; y < height; y += stride) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x += stride) {
        const srcIdx = rowOffset + x * 4;
        samplePixels[offset] = data[srcIdx];
        samplePixels[offset + 1] = data[srcIdx + 1];
        samplePixels[offset + 2] = data[srcIdx + 2];
        samplePixels[offset + 3] = data[srcIdx + 3];
        offset += 4;
      }
    }
  }

  const basePalette = quantizeGifPalette(
    offset === samplePixels.length ? samplePixels : samplePixels.subarray(0, offset),
    paletteSize
  );
  return ensureGifPaletteAnchors(basePalette, paletteSize);
}

/**
 * Encode canvas as GIF (single frame)
 */
function encodeGif(
  canvas: Canvas,
  colors: number = 256,
  disposal: number = 2,
  backgroundColor = '#ffffff',
  preserveTransparency = false
): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = new Uint8ClampedArray(imageData.data);
  const preparedData = prepareGifFramePixels(
    rgba,
    parseGifBackgroundColor(backgroundColor),
    preserveTransparency
  );

  const gif = createGifEncoder();
  const palette = ensureGifPaletteAnchors(
    quantizeGifPalette(preparedData, Math.min(256, Math.max(2, colors))),
    Math.min(256, Math.max(2, colors))
  );
  const index = indexGifPixels(preparedData, palette);
  const safeIndex = index.slice();

  gif.writeFrame(safeIndex, width, height, {
    palette,
    delay: 100,
    repeat: 0,
    dispose: disposal,
  });

  gif.finish();
  return Buffer.from(gif.bytes());
}

/**
 * Encode multiple canvases as animated GIF
 * @param frames Array of canvas frames
 * @param frameDelayMs Frame delay in milliseconds
 * @param colors Palette size 2-256
 */
function encodeAnimatedGif(
  frames: Canvas[],
  frameDelayMs: number = 100,
  colors: number = 256,
  disposal: number = 1,
  backgroundColor = '#ffffff',
  preserveTransparency = false
): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  if (frames.length === 0) {
    throw new Error('No frames to encode');
  }

  const width = frames[0].width;
  const height = frames[0].height;
  const gif = createGifEncoder();
  const paletteSize = Math.min(256, Math.max(2, colors));
  const bgRgb = parseGifBackgroundColor(backgroundColor);
  const sampledFrameCache = new Map<number, Uint8ClampedArray>();
  const getFrameData = (i: number, allowCache = false): Uint8ClampedArray => {
    if (allowCache) {
      const cached = sampledFrameCache.get(i);
      if (cached) return cached;
    }
    const ctx = frames[i].getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = new Uint8ClampedArray(imageData.data);
    const prepared = prepareGifFramePixels(rgba, bgRgb, preserveTransparency);
    if (allowCache) {
      sampledFrameCache.set(i, prepared.slice());
    }
    return prepared;
  };
  const globalPalette = buildGlobalGifPalette(
    (i) => getFrameData(i, true),
    frames.length,
    width,
    height,
    paletteSize
  );

  // gifenc expects delay in milliseconds (it converts to centiseconds internally)
  // Minimum 20ms — gifenc rounds <20ms to 0-1 centiseconds which browsers treat as 100ms
  const delayMs = Math.max(20, frameDelayMs);

  for (let i = 0; i < frames.length; i++) {
    const preparedData = sampledFrameCache.get(i) ?? getFrameData(i, false);
    const index = indexGifPixels(preparedData, globalPalette);
    const safeIndex = index.slice();

    // Only set repeat on first frame
    const frameOptions: Record<string, unknown> = {
      palette: globalPalette,
      delay: delayMs,
      dispose: disposal,
    };
    if (i === 0) {
      frameOptions.repeat = 0; // 0 = loop forever
    }

    gif.writeFrame(safeIndex, width, height, frameOptions);
  }

  gif.finish();
  sampledFrameCache.clear();
  return Buffer.from(gif.bytes());
}

// ============================================
// ANIMATION PATTERNS (server-side)
// ============================================

// AnimationPattern and AnimationEasing types imported from shared module as SharedAnimationPattern and AnimationEasing

function parseAnimationTarget(
  value: string | null | undefined,
  fallback: AnimationTarget = 'result'
): AnimationTarget {
  switch ((value || '').toLowerCase()) {
    case 'modules':
      return 'modules';
    case 'both':
      return 'both';
    case 'result':
      return 'result';
    default:
      return fallback;
  }
}

function parseAnimationWaveAxis(
  value: string | null | undefined,
  fallback: AnimationWaveAxis = 'y'
): AnimationWaveAxis {
  switch ((value || '').toLowerCase()) {
    case 'x':
    case 'horizontal':
    case 'left_right':
    case 'left-right':
      return 'x';
    case 'xy':
    case 'both':
    case 'dual':
      return 'xy';
    case 'y':
    case 'vertical':
    case 'top_bottom':
    case 'top-bottom':
      return 'y';
    default:
      return fallback;
  }
}

function hasAnimationEffect(effect: AnimationEffectConfig): boolean {
  return effect.pattern !== 'none' || effect.colorCycle;
}

function computeAnimationProgress(
  frameIndex: number,
  totalFrames: number,
  easing: AnimationEasing,
  reverse = false,
  bounce = false
): number {
  let progress = frameIndex / Math.max(1, totalFrames - 1);
  if (reverse) {
    progress = 1 - progress;
  }
  if (bounce) {
    progress = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
  }
  return applyAnimationEasing(progress, easing);
}

function hslToRgbTupleServer(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp >= 1 && hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp >= 2 && hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp >= 3 && hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp >= 4 && hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const m = light - c / 2;
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

function tintWavePixel(
  data: Uint8ClampedArray,
  i: number,
  waveColor: [number, number, number],
  waveIntensity: number
): void {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const brightness = (r + g + b) / 3;
  if (brightness < 128) {
    const tintAmount = waveIntensity * 0.62;
    data[i] = Math.min(255, r + waveColor[0] * tintAmount);
    data[i + 1] = Math.min(255, g + waveColor[1] * tintAmount);
    data[i + 2] = Math.min(255, b + waveColor[2] * tintAmount);
  } else {
    const darkenAmount = waveIntensity * 0.15;
    data[i] = Math.round(r * (1 - darkenAmount));
    data[i + 1] = Math.round(g * (1 - darkenAmount));
    data[i + 2] = Math.round(b * (1 - darkenAmount));
  }
}

function applyAnimationWaveWithAxisServer(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number,
  axis: AnimationWaveAxis = 'y'
): void {
  if (axis === 'y') {
    applyAnimationWave(data, progress, width, height, seed);
    return;
  }

  const waveFrequencyX = 3 + (seed % 5);
  const waveFrequencyY = 2 + ((seed * 3) % 5);
  const baseHue = (seed * 23) % 360;
  const twoPi = Math.PI * 2;

  for (let y = 0; y < height; y++) {
    const phaseY = Math.sin((y / height) * waveFrequencyY * twoPi + progress * twoPi);
    for (let x = 0; x < width; x++) {
      const phaseX = Math.sin((x / width) * waveFrequencyX * twoPi + progress * twoPi);
      const wavePhase =
        axis === 'xy' ? Math.max(-1, Math.min(1, phaseX * 0.65 + phaseY * 0.35)) : phaseX;
      const waveIntensity = (wavePhase + 1) / 2;
      const hueShift = axis === 'xy' ? wavePhase * 45 + (phaseX - phaseY) * 15 : wavePhase * 30;
      const waveColor = hslToRgbTupleServer(baseHue + hueShift, 72, 50);
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      tintWavePixel(data, i, waveColor, waveIntensity);
    }
  }
}

function applyAnimationEffectToImageDataServer(
  frameData: Uint8ClampedArray,
  width: number,
  height: number,
  progress: number,
  effect: AnimationEffectConfig
): void {
  switch (effect.pattern) {
    case 'pulse':
      applyAnimationPulse(frameData, progress, effect.seed);
      break;
    case 'wave':
      applyAnimationWaveWithAxisServer(
        frameData,
        progress,
        width,
        height,
        effect.seed,
        effect.waveAxis
      );
      break;
    case 'scanline':
      applyAnimationScanline(frameData, progress, width, height, effect.seed);
      break;
    case 'shimmer':
      applyAnimationShimmer(frameData, progress, width, height, effect.seed);
      break;
    case 'drift':
      applyAnimationDrift(frameData, progress, width, height, effect.seed);
      break;
    case 'color_cycle':
      applyAnimationColorCycle(frameData, progress, effect.seed);
      break;
    default:
      break;
  }

  if (effect.colorCycle && effect.pattern !== 'color_cycle') {
    applyAnimationColorCycle(frameData, progress, effect.seed + 101);
  }
}

/**
 * Generate animation frames using a pattern effect
 */
function generatePatternFramesServer(
  sourceCanvas: Canvas,
  pattern: AnimationPattern,
  frameCount: number = 24,
  seed: number = 0,
  easing: AnimationEasing = 'linear',
  waveAxis: AnimationWaveAxis = 'y',
  colorCycle = false,
  reverse = false,
  bounce = false
): Canvas[] {
  if (pattern === 'none' && !colorCycle) {
    return [sourceCanvas];
  }

  const frames: Canvas[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const sourceCtx = sourceCanvas.getContext('2d');
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  for (let i = 0; i < frameCount; i++) {
    const progress = computeAnimationProgress(i, frameCount, easing, reverse, bounce);
    const frame = createCanvas(width, height);
    const ctx = frame.getContext('2d');

    const frameData = ctx.createImageData(width, height);
    frameData.data.set(sourceData.data);

    applyAnimationEffectToImageDataServer(frameData.data, width, height, progress, {
      pattern,
      seed,
      easing,
      colorCycle,
      reverse,
      bounce,
      target: 'result',
      waveAxis,
    });

    ctx.putImageData(frameData, 0, 0);
    frames.push(frame);
  }

  return frames;
}

function applyPatternToFrameServer(
  sourceCanvas: Canvas,
  pattern: AnimationPattern,
  frameIndex: number,
  totalFrames: number,
  seed: number,
  easing: AnimationEasing,
  colorCycle: boolean,
  reverse = false,
  bounce = false,
  waveAxis: AnimationWaveAxis = 'y'
): Canvas {
  if (pattern === 'none' && !colorCycle) {
    return sourceCanvas;
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const frame = createCanvas(width, height);
  const ctx = frame.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const frameData = ctx.getImageData(0, 0, width, height);
  const progress = computeAnimationProgress(frameIndex, totalFrames, easing, reverse, bounce);
  applyAnimationEffectToImageDataServer(frameData.data, width, height, progress, {
    pattern,
    seed,
    easing,
    colorCycle,
    reverse,
    bounce,
    target: 'result',
    waveAxis,
  });

  ctx.putImageData(frameData, 0, 0);
  return frame;
}

function applyAnimationEffectsToCanvasServer(
  sourceCanvas: Canvas,
  effects: AnimationEffectConfig[],
  frameIndex: number,
  totalFrames: number
): Canvas {
  if (!effects.length) {
    return sourceCanvas;
  }

  let frame = sourceCanvas;
  for (const effect of effects) {
    if (!hasAnimationEffect(effect)) {
      continue;
    }
    frame = applyPatternToFrameServer(
      frame,
      effect.pattern,
      frameIndex,
      totalFrames,
      effect.seed,
      effect.easing,
      effect.colorCycle,
      effect.reverse,
      effect.bounce,
      effect.waveAxis
    );
  }
  return frame;
}

function applyModuleAnimationToConfigServer(
  baseConfig: Record<string, unknown>,
  effects: AnimationEffectConfig[],
  frameIndex: number,
  totalFrames: number,
  baseJitter: number
): Record<string, unknown> {
  if (!effects.length && baseJitter <= 0) {
    return { ...baseConfig, frameIndex, animationFrames: totalFrames };
  }

  const frameConfig: Record<string, unknown> = {
    ...baseConfig,
    frameIndex,
    animationFrames: totalFrames,
  };
  let jitter = Math.max(0, Number.isFinite(baseJitter) ? baseJitter : 0);
  let moduleGap = typeof frameConfig.moduleGap === 'number' ? (frameConfig.moduleGap as number) : 0;
  let dotRotationDeg =
    typeof frameConfig.dotRotationDeg === 'number' ? (frameConfig.dotRotationDeg as number) : 0;

  for (const effect of effects) {
    const progress = computeAnimationProgress(
      frameIndex,
      totalFrames,
      effect.easing,
      effect.reverse,
      effect.bounce
    );
    const phase = Math.sin(progress * Math.PI * 2 + effect.seed * 0.013);
    const intensity = (phase + 1) / 2;
    switch (effect.pattern) {
      case 'pulse':
        jitter += 0.35 + intensity * 0.75;
        moduleGap += intensity * 3.8;
        break;
      case 'wave':
        jitter += 0.8 + intensity * 0.65;
        dotRotationDeg += (effect.waveAxis === 'xy' ? 18 : 12) * phase;
        moduleGap += intensity * 2.4;
        break;
      case 'scanline':
        jitter += intensity * 0.9;
        moduleGap += (1 - intensity) * 2.2;
        break;
      case 'shimmer':
        jitter += (Math.sin((frameIndex + effect.seed * 3) * 1.7) + 1) * 0.42;
        dotRotationDeg += Math.cos((frameIndex + effect.seed) * 0.5) * 6;
        break;
      case 'drift':
        jitter += 0.45 + intensity * 0.95;
        dotRotationDeg += phase * 10;
        break;
      case 'color_cycle':
        jitter += 0.2 + intensity * 0.6;
        break;
      default:
        break;
    }
    if (effect.colorCycle) {
      jitter += 0.12;
    }
  }

  frameConfig.moduleJitterPx = Math.min(2.4, Math.max(0, Number(jitter.toFixed(3))));
  frameConfig.moduleGap = Math.min(35, Math.max(0, Number(moduleGap.toFixed(2))));
  frameConfig.dotRotationDeg = Math.round(dotRotationDeg);
  return frameConfig;
}

function calculateTemporalOffsetServer(
  frameIndex: number,
  mode: AnimationTemporalDitherMode,
  seed = 0
): number {
  if (mode === 'off') return 0;
  if (mode === 'blue_noise') {
    const phi = 1.618033988749895;
    return (frameIndex * phi + seed * 0.1) % 1;
  }
  // flicker_safe
  const safeOffsets = [
    0, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875, 0.0625, 0.5625, 0.3125, 0.8125, 0.1875, 0.6875,
    0.4375, 0.9375,
  ];
  return (safeOffsets[frameIndex % safeOffsets.length] + seed * 0.01) % 1;
}

function applyTemporalNoiseToCanvasServer(
  sourceCanvas: Canvas,
  offset: number,
  strength = 0.012
): Canvas {
  if (offset === 0 || strength <= 0) {
    return sourceCanvas;
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const phi = 1.618033988749895;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const noise = ((x * phi + y * phi * phi + offset * 1000) % 1) - 0.5;
    const adjust = Math.round(noise * strength * 255);
    data[i] = Math.max(0, Math.min(255, data[i] + adjust));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjust));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjust));
  }

  ctx.putImageData(imageData, 0, 0);
  return output;
}

function interpolateOverlayFramesServer(
  previousFrame: Canvas,
  currentFrame: Canvas,
  mode: 'none' | 'crossfade' | 'morph',
  t = 0.5
): Canvas {
  if (mode === 'none') return currentFrame;

  const width = currentFrame.width;
  const height = currentFrame.height;
  const output = createCanvas(width, height);
  const outCtx = output.getContext('2d');

  if (mode === 'crossfade') {
    outCtx.globalAlpha = Math.max(0, Math.min(1, 1 - t));
    outCtx.drawImage(previousFrame, 0, 0);
    outCtx.globalAlpha = Math.max(0, Math.min(1, t));
    outCtx.drawImage(currentFrame, 0, 0);
    outCtx.globalAlpha = 1;
    return output;
  }

  const prevCtx = previousFrame.getContext('2d');
  const currCtx = currentFrame.getContext('2d');
  const prevData = prevCtx.getImageData(0, 0, width, height);
  const currData = currCtx.getImageData(0, 0, width, height);
  const mixed = outCtx.createImageData(width, height);

  for (let i = 0; i < mixed.data.length; i++) {
    mixed.data[i] = Math.round(prevData.data[i] * (1 - t) + currData.data[i] * t);
  }

  outCtx.putImageData(mixed, 0, 0);
  return output;
}

function _blendOverlayEffectServer(
  baseFrame: Canvas,
  effectFrame: Canvas,
  effectOpacity: number
): Canvas {
  const width = baseFrame.width;
  const height = baseFrame.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext('2d');
  ctx.drawImage(baseFrame, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, effectOpacity));
  ctx.drawImage(effectFrame, 0, 0);
  ctx.globalAlpha = 1;
  return output;
}

function _compositeArtworkOverlayServer(
  artworkFrame: Canvas,
  overlayFrame: Canvas,
  opacity: number,
  blendMode: GlobalCompositeOperation = 'soft-light'
): Canvas {
  const width = artworkFrame.width;
  const height = artworkFrame.height;
  const output = createCanvas(width, height);
  const ctx = output.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(artworkFrame, 0, 0);

  const effectiveOpacity = Math.max(0, Math.min(1, opacity));
  if (effectiveOpacity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = effectiveOpacity;
    ctx.drawImage(overlayFrame, 0, 0, width, height);
    ctx.restore();
  }
  return output;
}

// All pattern functions, color conversion, and seeded random are now imported from shared module

// ============================================
// OVERLAY PREPROCESSING (server-side)
// ============================================

/**
 * Crop overlay image using center-based coordinates (matches client behavior)
 * @param source Source canvas
 * @param centerX Crop center X as fraction 0-1
 * @param centerY Crop center Y as fraction 0-1
 * @param sizeFraction Crop size as fraction of min(width, height) 0-1
 */
function cropOverlayServer(
  source: Canvas,
  centerX: number,
  centerY: number,
  sizeFraction: number
): Canvas {
  const minDim = Math.min(source.width, source.height);
  const cropSize = Math.round(minDim * Math.max(0.1, Math.min(1, sizeFraction)));

  // Calculate crop region centered at (centerX, centerY)
  let cropX = Math.round(source.width * centerX - cropSize / 2);
  let cropY = Math.round(source.height * centerY - cropSize / 2);

  // Clamp to image bounds
  cropX = Math.max(0, Math.min(source.width - cropSize, cropX));
  cropY = Math.max(0, Math.min(source.height - cropSize, cropY));

  const result = createCanvas(cropSize, cropSize);
  const ctx = result.getContext('2d');
  ctx.drawImage(source, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  return result;
}

/**
 * Helper: Convert RGB to grayscale using luminance formula
 */
function rgbToGrayServer(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Apply convolution filter to image data
 */
function convolveServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
  divisor?: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data);
  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);
  const div = divisor ?? (kernel.flat().reduce((a, b) => a + b, 0) || 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.max(0, Math.min(width - 1, x + kx - kHalf));
          const py = Math.max(0, Math.min(height - 1, y + ky - kHalf));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky][kx];

          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }

      const idx = (y * width + x) * 4;
      result[idx] = Math.max(0, Math.min(255, Math.round(r / div)));
      result[idx + 1] = Math.max(0, Math.min(255, Math.round(g / div)));
      result[idx + 2] = Math.max(0, Math.min(255, Math.round(b / div)));
    }
  }

  return result;
}

/**
 * Apply box blur to image data
 */
function blurServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  if (radius <= 0) return data;
  const size = 2 * Math.min(radius, 10) + 1; // Cap radius at 10 for performance
  const kernel = new Array(size).fill(null).map(() => new Array(size).fill(1));
  return convolveServer(data, width, height, kernel);
}

/**
 * Apply sharpening to image data
 */
function sharpenServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
): Uint8ClampedArray {
  if (amount <= 0) return data;
  const strength = amount / 100; // Normalize 0-100 to 0-1
  const kernel = [
    [0, -strength, 0],
    [-strength, 1 + 4 * strength, -strength],
    [0, -strength, 0],
  ];
  return convolveServer(data, width, height, kernel, 1);
}

/**
 * Apply posterize (color reduction) to image data
 */
function posterizeServer(data: Uint8ClampedArray, levels: number): Uint8ClampedArray {
  if (levels <= 1) return data;
  const result = new Uint8ClampedArray(data);
  const step = 255 / (levels - 1);

  for (let i = 0; i < result.length; i += 4) {
    result[i] = Math.round(Math.round(result[i] / step) * step);
    result[i + 1] = Math.round(Math.round(result[i + 1] / step) * step);
    result[i + 2] = Math.round(Math.round(result[i + 2] / step) * step);
  }

  return result;
}

/**
 * Apply threshold (binary) to image data
 */
function thresholdServer(data: Uint8ClampedArray, level: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data);

  for (let i = 0; i < result.length; i += 4) {
    const gray = rgbToGrayServer(result[i], result[i + 1], result[i + 2]);
    const value = gray > level ? 255 : 0;
    result[i] = value;
    result[i + 1] = value;
    result[i + 2] = value;
  }

  return result;
}

/**
 * Apply Sobel edge detection to image data
 */
function sobelEdgeServer(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length);

  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = rgbToGrayServer(data[idx], data[idx + 1], data[idx + 2]);
          gx += gray * sobelX[ky + 1][kx + 1];
          gy += gray * sobelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.min(255, Math.hypot(gx, gy));
      const idx = (y * width + x) * 4;
      result[idx] = magnitude;
      result[idx + 1] = magnitude;
      result[idx + 2] = magnitude;
      result[idx + 3] = data[idx + 3];
    }
  }

  return result;
}

/**
 * Apply Canny edge detection to image data (simplified: Sobel + hysteresis threshold)
 */
function cannyEdgeServer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  lowThreshold: number = 50,
  highThreshold: number = 150
): Uint8ClampedArray {
  // First apply Sobel
  const sobelResult = sobelEdgeServer(data, width, height);
  const result = new Uint8ClampedArray(sobelResult);

  // Apply hysteresis thresholding
  for (let i = 0; i < result.length; i += 4) {
    const magnitude = result[i];
    const value = magnitude > highThreshold ? 255 : magnitude > lowThreshold ? 128 : 0;
    result[i] = value;
    result[i + 1] = value;
    result[i + 2] = value;
  }

  return result;
}

/**
 * Apply all overlay filters server-side (matches client filters)
 * Creates a new canvas to avoid mutating the source.
 */
function hue2rgbServer(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function applyHueSaturationToPixel(
  r: number,
  g: number,
  b: number,
  saturation: number,
  hue: number
): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h += hue / (2 * Math.PI);
  if (h > 1) h -= 1;
  if (h < 0) h += 1;
  s = Math.max(0, Math.min(1, s * (1 + saturation)));

  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgbServer(p, q, h + 1 / 3), hue2rgbServer(p, q, h), hue2rgbServer(p, q, h - 1 / 3)];
}

function adjustPixelColor(
  r: number,
  g: number,
  b: number,
  invert: boolean,
  brightness: number,
  contrastFactor: number,
  gamma: number,
  saturation: number,
  hue: number
): [number, number, number] {
  if (invert) {
    r = 1 - r;
    g = 1 - g;
    b = 1 - b;
  }
  r += brightness;
  g += brightness;
  b += brightness;
  r = (r - 0.5) * contrastFactor + 0.5;
  g = (g - 0.5) * contrastFactor + 0.5;
  b = (b - 0.5) * contrastFactor + 0.5;
  if (gamma !== 1) {
    r = Math.max(0, r) ** (1 / gamma);
    g = Math.max(0, g) ** (1 / gamma);
    b = Math.max(0, b) ** (1 / gamma);
  }
  if (saturation !== 0 || hue !== 0) {
    [r, g, b] = applyHueSaturationToPixel(r, g, b, saturation, hue);
  }
  return [r, g, b];
}

function applyPostProcessFilters(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  blurRadius: number,
  sharpenAmount: number,
  posterizeLevels: number,
  thresholdLevel: number | undefined,
  edgeMode: string
): void {
  if (blurRadius > 0) data.set(blurServer(data, width, height, blurRadius));
  if (sharpenAmount > 0) data.set(sharpenServer(data, width, height, sharpenAmount));
  if (posterizeLevels > 1) data.set(posterizeServer(data, posterizeLevels));
  if (thresholdLevel !== undefined) data.set(thresholdServer(data, thresholdLevel));
  if (edgeMode === 'sobel') data.set(sobelEdgeServer(data, width, height));
  else if (edgeMode === 'canny') data.set(cannyEdgeServer(data, width, height));
}

function applyOverlayFiltersServer(
  source: Canvas,
  options: {
    brightness?: number;
    contrast?: number;
    gamma?: number;
    saturation?: number;
    hue?: number;
    invert?: boolean;
    blur?: number;
    sharpen?: number;
    posterize?: number;
    threshold?: number;
    edge?: 'off' | 'sobel' | 'canny';
  }
): Canvas {
  const result = createCanvas(source.width, source.height);
  const resultCtx = result.getContext('2d');
  resultCtx.drawImage(source, 0, 0);

  const imageData = resultCtx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;

  const brightness = (options.brightness ?? 0) / 100;
  const contrast = (options.contrast ?? 0) / 100;
  const gamma = options.gamma ?? 1;
  const saturation = (options.saturation ?? 0) / 100;
  const hue = (options.hue ?? 0) * (Math.PI / 180);
  const invert = options.invert ?? false;
  const contrastFactor = (1 + contrast) / (1 - contrast * 0.5);

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = adjustPixelColor(
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      invert,
      brightness,
      contrastFactor,
      gamma,
      saturation,
      hue
    );
    data[i] = Math.round(Math.max(0, Math.min(1, r)) * 255);
    data[i + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
    data[i + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
  }

  applyPostProcessFilters(
    data,
    result.width,
    result.height,
    options.blur ?? 0,
    options.sharpen ?? 0,
    options.posterize ?? 0,
    options.threshold,
    options.edge ?? 'off'
  );

  resultCtx.putImageData(imageData, 0, 0);
  return result;
}

/**
 * Flip overlay canvas horizontally and/or vertically
 */
function flipOverlayServer(source: Canvas, horizontal: boolean, vertical: boolean): Canvas {
  if (!(horizontal || vertical)) return source;

  const result = createCanvas(source.width, source.height);
  const ctx = result.getContext('2d');

  ctx.translate(horizontal ? source.width : 0, vertical ? source.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(source, 0, 0);

  return result;
}

/**
 * Rotate overlay canvas by degrees
 */
function rotateOverlayServer(source: Canvas, degrees: number): Canvas {
  if (degrees === 0) return source;

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = Math.round(source.width * cos + source.height * sin);
  const newHeight = Math.round(source.width * sin + source.height * cos);

  const result = createCanvas(newWidth, newHeight);
  const ctx = result.getContext('2d');

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return result;
}

// ============================================
// GIF FRAME PARSING (server-side)
// ============================================

interface ServerAnimationFrame {
  canvas: Canvas;
  delay: number; // milliseconds
  disposalType: number;
}

/**
 * Detect if an ArrayBuffer contains a GIF
 */
function isGifBuffer(buffer: ArrayBuffer): boolean {
  return isGifSignature(buffer);
}

/**
 * Parse a GIF file and extract frames as Canvas elements (server-side)
 * Adapted from src/modules/animation.ts for Node.js
 */
function parseGifFramesServer(
  arrayBuffer: ArrayBuffer,
  disposalHandling: 'respect' | 'simplify' = 'respect'
): ServerAnimationFrame[] {
  const decoded = decodeGif(arrayBuffer);

  if (decoded.frames.length === 0) {
    throw new Error('No frames found in GIF');
  }

  // Limit frame count to prevent excessive processing
  const framesToProcess = decoded.frames.slice(0, MAX_GIF_FRAMES);
  if (decoded.frames.length > MAX_GIF_FRAMES) {
    // Frame count exceeded MAX_GIF_FRAMES — silently truncated above
  }

  // Calculate total duration and warn if excessive
  const totalDuration = framesToProcess.reduce((sum, f) => sum + f.delay, 0);
  if (totalDuration > MAX_GIF_DURATION_MS) {
    // Duration exceeds limit but we proceed anyway for user flexibility
  }

  const { width, height } = decoded;

  // Create a persistent canvas for compositing frames
  const compositeCanvas = createCanvas(width, height);
  const compositeCtx = compositeCanvas.getContext('2d');
  // Ensure deterministic transparent background before applying delta patches.
  compositeCtx.clearRect(0, 0, width, height);

  // Reuse a single patch canvas to avoid repeated allocations and stale buffer issues.
  let maxPatchWidth = 1;
  let maxPatchHeight = 1;
  for (const frame of framesToProcess) {
    maxPatchWidth = Math.max(maxPatchWidth, frame.dims.width);
    maxPatchHeight = Math.max(maxPatchHeight, frame.dims.height);
  }
  const patchCanvas = createCanvas(maxPatchWidth, maxPatchHeight);
  const patchCtx = patchCanvas.getContext('2d');

  const animationFrames: ServerAnimationFrame[] = [];

  for (const frame of framesToProcess) {
    const { dims, patch, disposalType, delay } = frame;
    const effectiveDisposal =
      disposalHandling === 'simplify' && disposalType === 3 ? 2 : disposalType;
    let restoreData: ReturnType<typeof compositeCtx.getImageData> | null = null;

    if (effectiveDisposal === 3) {
      restoreData = compositeCtx.getImageData(dims.left, dims.top, dims.width, dims.height);
    }

    // Create ImageData from patch
    const imageData = compositeCtx.createImageData(dims.width, dims.height);
    imageData.data.set(new Uint8ClampedArray(patch));

    // Draw this frame patch onto a cleared temporary patch canvas.
    patchCtx.clearRect(0, 0, dims.width, dims.height);
    patchCtx.putImageData(imageData, 0, 0);

    // Draw patch onto composite canvas
    compositeCtx.drawImage(
      patchCanvas,
      0,
      0,
      dims.width,
      dims.height,
      dims.left,
      dims.top,
      dims.width,
      dims.height
    );

    // Create output canvas for this frame
    const outputCanvas = createCanvas(width, height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(compositeCanvas, 0, 0);

    animationFrames.push({
      canvas: outputCanvas,
      delay, // already in milliseconds (gifuct-js converts centiseconds internally)
      disposalType: effectiveDisposal,
    });

    // Handle disposal
    if (effectiveDisposal === 2) {
      // Restore to background
      compositeCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (effectiveDisposal === 3 && restoreData) {
      // Restore to previous canvas content for next frame compositing
      compositeCtx.putImageData(restoreData, dims.left, dims.top);
    }
    // disposalType 0 or 1: leave frame in place
  }

  return animationFrames;
}

function decimateFramesToMaxFps(
  frames: ServerAnimationFrame[],
  targetFps: number
): ServerAnimationFrame[] {
  if (frames.length <= 1 || targetFps <= 0) {
    return frames;
  }

  const frameDelays = frames.map((frame) => {
    const delay = Number.isFinite(frame.delay) ? frame.delay : 100;
    return delay > 0 ? delay : 100;
  });
  const totalDelay = frameDelays.reduce((sum, delay) => sum + delay, 0);
  const sourceFps = totalDelay > 0 ? (frames.length * 1000) / totalDelay : 0;

  if (!sourceFps || sourceFps <= targetFps) {
    return frames;
  }

  // Keep duration constant while reducing frame count based on requested FPS.
  const targetFrameCount = Math.max(1, Math.floor((totalDelay * targetFps) / 1000));
  return decimateFramesToMaxCount(frames, targetFrameCount);
}

function decimateFramesToMaxCount(
  frames: ServerAnimationFrame[],
  maxFrames: number
): ServerAnimationFrame[] {
  if (frames.length <= 1 || maxFrames <= 0 || frames.length <= maxFrames) {
    return frames;
  }

  const delays = frames.map((frame) => {
    const delay = Number.isFinite(frame.delay) ? frame.delay : 100;
    return delay > 0 ? delay : 100;
  });
  const totalDelay = delays.reduce((sum, delay) => sum + delay, 0);
  if (totalDelay <= 0) {
    return frames.slice(0, maxFrames);
  }

  const desiredFrameCount = Math.min(frames.length, Math.max(1, Math.floor(maxFrames)));
  if (desiredFrameCount === 1) {
    return [{ ...frames[0], delay: totalDelay }];
  }

  const keepIndices = new Set<number>([0, frames.length - 1]);
  const intervals = desiredFrameCount - 1;
  for (let step = 1; step < intervals; step++) {
    const targetTime = (totalDelay * step) / intervals;
    let idx = 0;
    let elapsed = 0;
    while (idx < frames.length - 1 && elapsed + delays[idx] <= targetTime) {
      elapsed += delays[idx];
      idx += 1;
    }
    keepIndices.add(idx);
  }

  const orderedKeepIndices = Array.from(keepIndices).sort((a, b) => a - b);
  const decimated: ServerAnimationFrame[] = [];
  for (let pos = 0; pos < orderedKeepIndices.length; pos++) {
    const startIdx = orderedKeepIndices[pos];
    const endExclusive =
      pos + 1 < orderedKeepIndices.length ? orderedKeepIndices[pos + 1] : frames.length;
    let mergedDelay = 0;
    for (let i = startIdx; i < endExclusive; i++) {
      mergedDelay += delays[i];
    }
    decimated.push({
      ...frames[startIdx],
      delay: mergedDelay,
    });
  }
  return decimated;
}

/**
 * Encode multiple canvases as animated GIF with per-frame delays
 */
function encodeAnimatedGifWithDelays(
  frames: ServerAnimationFrame[],
  colors: number = 256,
  disposal: number = 1,
  backgroundColor = '#ffffff',
  preserveTransparency = false
): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  if (frames.length === 0) {
    throw new Error('No frames to encode');
  }

  const width = frames[0].canvas.width;
  const height = frames[0].canvas.height;
  const gif = createGifEncoder();
  const paletteSize = Math.min(256, Math.max(2, colors));
  const bgRgb = parseGifBackgroundColor(backgroundColor);
  const sampledFrameCache = new Map<number, Uint8ClampedArray>();
  const getFrameData = (i: number, allowCache = false): Uint8ClampedArray => {
    if (allowCache) {
      const cached = sampledFrameCache.get(i);
      if (cached) return cached;
    }
    const ctx = frames[i].canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = new Uint8ClampedArray(imageData.data);
    const prepared = prepareGifFramePixels(rgba, bgRgb, preserveTransparency);
    if (allowCache) {
      sampledFrameCache.set(i, prepared.slice());
    }
    return prepared;
  };
  const globalPalette = buildGlobalGifPalette(
    (i) => getFrameData(i, true),
    frames.length,
    width,
    height,
    paletteSize
  );

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const preparedData = sampledFrameCache.get(i) ?? getFrameData(i, false);
    const index = indexGifPixels(preparedData, globalPalette);
    const safeIndex = index.slice();

    // gifenc expects delay in milliseconds (it converts to centiseconds internally)
    // Minimum 20ms — gifenc rounds <20ms to 0-1 centiseconds which browsers treat as 100ms
    const delayMs = Math.max(20, frame.delay);

    const frameOptions: Record<string, unknown> = {
      palette: globalPalette,
      delay: delayMs,
      dispose: disposal,
    };
    if (i === 0) {
      frameOptions.repeat = 0; // 0 = loop forever
    }

    gif.writeFrame(safeIndex, width, height, frameOptions);
  }

  gif.finish();
  sampledFrameCache.clear();
  return Buffer.from(gif.bytes());
}

/**
 * Parse gradient stops from URL parameter
 * Format: color1,pos1,color2,pos2,...
 * Example: ff0000,0,00ff00,0.5,0000ff,1
 */
function parseGradientStops(stopsParam: string): Array<{ pos: number; color: string }> {
  const parts = stopsParam.split(',');
  const stops: Array<{ pos: number; color: string }> = [];

  for (let i = 0; i < parts.length - 1; i += 2) {
    const color = `#${parts[i]}`;
    const pos = Number.parseFloat(parts[i + 1]);
    if (!Number.isNaN(pos)) {
      stops.push({ color, pos });
    }
  }

  return stops.length > 0
    ? stops
    : [
        { color: '#000000', pos: 0 },
        { color: '#000000', pos: 1 },
      ];
}

interface FetchedImage {
  canvas: Canvas;
  arrayBuffer: ArrayBuffer;
  isAnimatedGif: boolean;
}

function isPathWithinRoot(candidatePath: string, rootPath: string): boolean {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedCandidate = path.resolve(candidatePath);
  if (resolvedCandidate === resolvedRoot) {
    return true;
  }
  return resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`);
}

async function decodeOverlayBuffer(buffer: Buffer): Promise<FetchedImage | null> {
  if (buffer.byteLength <= 0 || buffer.byteLength > MAX_OVERLAY_BYTES) {
    return null;
  }

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  let isAnimatedGif = false;
  if (isGifBuffer(arrayBuffer)) {
    try {
      const decoded = decodeGif(arrayBuffer);
      isAnimatedGif = decoded.frames.length > 1;
    } catch {}
  }

  const img = await nodeCanvasFactory.loadImage(buffer);

  // Validate image dimensions
  if (!(img.width && img.height) || img.width <= 0 || img.height <= 0) {
    return null;
  }

  // Validate pixel count to prevent memory issues
  const pixelCount = img.width * img.height;
  if (pixelCount > MAX_OVERLAY_PIXELS) {
    return null;
  }

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return {
    canvas,
    arrayBuffer,
    isAnimatedGif,
  };
}

async function readLocalOverlayFile(fileUrl: URL): Promise<FetchedImage | null> {
  if (!process.env.NETLIFY_DEV) {
    return null;
  }

  let overlayPath: string;
  try {
    overlayPath = fileURLToPath(fileUrl);
  } catch {
    return null;
  }

  const localOverlayRoot = process.env.ANQR_LOCAL_OVERLAY_ROOT
    ? path.resolve(process.env.ANQR_LOCAL_OVERLAY_ROOT)
    : path.resolve(process.cwd(), 'public');

  if (!isPathWithinRoot(overlayPath, localOverlayRoot)) {
    return null;
  }

  try {
    const buffer = await fs.readFile(overlayPath);
    return decodeOverlayBuffer(buffer);
  } catch {
    return null;
  }
}

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function fetchOverlayWithValidatedRedirects(
  initialUrl: URL,
  signal: AbortSignal
): Promise<Response | null> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_OVERLAY_REDIRECTS; redirectCount++) {
    if (!process.env.NETLIFY_DEV && (await _isPrivateHostname(currentUrl.hostname))) {
      return null;
    }

    const response = await fetch(currentUrl.toString(), {
      headers: {
        'User-Agent': 'ANQR-QR-Generator/1.0',
      },
      signal,
      redirect: 'manual',
    });

    if (!isRedirectStatus(response.status)) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) {
      return null;
    }

    let redirectedUrl: URL;
    try {
      redirectedUrl = new URL(location, currentUrl);
    } catch {
      return null;
    }

    if (!['http:', 'https:'].includes(redirectedUrl.protocol)) {
      return null;
    }

    currentUrl = redirectedUrl;
  }

  return null;
}

/**
 * Fetch an image from URL and load it into a canvas
 * Also returns the raw array buffer to detect animated GIFs
 */
async function validateAndFetchOverlay(
  url: string
): Promise<{ localResult: FetchedImage | null } | { response: Response } | null> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'file:') {
      return { localResult: await readLocalOverlayFile(parsedUrl) };
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    if (!process.env.NETLIFY_DEV && (await _isPrivateHostname(parsedUrl.hostname))) {
      return null;
    }
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;
  try {
    response = await fetchOverlayWithValidatedRedirects(parsedUrl, controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response?.ok) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') || '';
  const validImageTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
  ];
  const isImage = validImageTypes.some((type) => contentType.toLowerCase().startsWith(type));
  if (!isImage && contentType && !contentType.startsWith('application/octet-stream')) {
    return null;
  }

  return { response };
}

async function streamResponseBody(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number
): Promise<Buffer | null> {
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const combinedBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combinedBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return Buffer.from(combinedBytes);
}

async function fetchImageWithBuffer(url: string): Promise<FetchedImage | null> {
  try {
    const fetchResult = await validateAndFetchOverlay(url);
    if (!fetchResult) return null;
    if ('localResult' in fetchResult) return fetchResult.localResult;

    const reader = fetchResult.response.body?.getReader();
    if (!reader) return null;

    const buffer = await streamResponseBody(reader, MAX_OVERLAY_BYTES);
    if (!buffer) return null;

    return decodeOverlayBuffer(buffer);
  } catch {
    return null;
  }
}

/**
 * Fetch an image from URL and load it into a canvas (legacy wrapper)
 */
async function fetchImageAsCanvas(url: string): Promise<ReturnType<typeof createCanvas> | null> {
  const result = await fetchImageWithBuffer(url);
  return result?.canvas ?? null;
}

let animatedRenderQueue: Promise<void> = Promise.resolve();

async function acquireAnimatedRenderLock(): Promise<() => void> {
  let release: (() => void) | null = null;
  const waitTurn = animatedRenderQueue;
  animatedRenderQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await waitTurn;
  return () => {
    if (release) {
      release();
      release = null;
    }
  };
}

function isGifLikeImageParam(value: string | null | undefined): boolean {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    return new URL(raw).pathname.toLowerCase().endsWith('.gif');
  } catch {
    return raw.toLowerCase().split('?')[0].endsWith('.gif');
  }
}

function shouldSerializeAnimatedRender(params: URLSearchParams): boolean {
  const format = (params.get('format') || '').toLowerCase();
  if (format === 'gif') return true;

  const overlayType = (params.get('ovType') || '').toLowerCase();
  if (overlayType === 'gif') return true;

  if (isGifLikeImageParam(params.get('img'))) return true;

  const pattern1 = (params.get('animPattern') || 'none').toLowerCase();
  const pattern2 = (params.get('animPattern2') || 'none').toLowerCase();
  return pattern1 !== 'none' || pattern2 !== 'none';
}

async function lookupBlobCache(cacheKey: string, skipCache: boolean): Promise<Response | null> {
  if (skipCache) return null;
  try {
    const store = getBlobStoreOrNull();
    if (store) {
      const cached = await store.getWithMetadata(cacheKey, { type: 'arrayBuffer' });
      if (cached?.data) {
        const cachedMeta = cached.metadata as Record<string, string> | undefined;
        qrFnLog('[BLOB] cache HIT', {
          size: (cached.data as ArrayBuffer).byteLength,
          contentType: cachedMeta?.contentType,
        });
        return new Response(new Uint8Array(cached.data as ArrayBuffer), {
          status: 200,
          headers: {
            'Content-Type': cachedMeta?.contentType || 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-ANQR-Cache': 'hit',
            ...CORS_HEADERS,
          },
        });
      }
      qrFnLog('[BLOB] cache MISS');
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled('missing_blob_env');
    } else {
      console.error('[BLOB] cache read ERROR:', error_);
    }
  }
  return null;
}

async function writeBlobCache(
  cacheKey: string,
  outputBuffer: Buffer,
  contentType: string
): Promise<void> {
  try {
    qrFnLog('[BLOB] writing cache...', {
      cacheKey: cacheKey.slice(0, 80),
      size: outputBuffer.byteLength,
      contentType,
    });
    const store = getBlobStoreOrNull();
    if (store) {
      await store.set(cacheKey, new Blob([outputBuffer]), {
        metadata: { contentType, generatedAt: new Date().toISOString() },
      });
      await store.delete(SENTINEL_PREFIX + cacheKey).catch(() => {});
      qrFnLog('[BLOB] cache write OK');
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled('missing_blob_env');
    } else {
      console.error('[BLOB] cache write FAILED:', error_);
    }
  }
}

async function triggerBackgroundRender(cacheKey: string, requestUrl: string): Promise<void> {
  let shouldTrigger = true;
  try {
    const store = getBlobStoreOrNull();
    if (store) {
      const sentinelKey = SENTINEL_PREFIX + cacheKey;
      const existing = await store.get(sentinelKey, { type: 'text' });
      if (existing && Date.now() - Number(existing) < SENTINEL_TTL_MS) {
        shouldTrigger = false;
        qrFnLog('[BLOB] sentinel: already rendering (age:', Date.now() - Number(existing), 'ms)');
      } else {
        await store.set(sentinelKey, String(Date.now()));
        qrFnLog('[BLOB] sentinel: set new sentinel');
      }
    }
  } catch (error_) {
    if (isMissingBlobsEnvironmentError(error_)) {
      markBlobStoreDisabled('missing_blob_env');
    } else {
      console.error('[BLOB] sentinel ERROR:', error_);
    }
  }
  if (shouldTrigger) {
    try {
      const bgUrl = new URL(requestUrl);
      bgUrl.searchParams.set('_fullRender', '1');
      const siteUrl = bgUrl.origin || process.env.URL || 'https://anqr.link';
      qrFnLog('[BG:TRIGGER] posting to background function', {
        url: bgUrl.toString().slice(0, 120),
      });
      fetch(`${siteUrl}/.netlify/functions/qr-render-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: bgUrl.toString() }),
      })
        .then((r) => qrFnLog('[BG:TRIGGER]', r.status))
        .catch((err) => console.error('[BG:TRIGGER:FAIL]', err));
    } catch {
      // Background trigger failure is non-fatal
    }
  }
}

function scaleAndWatermarkFrame(
  frameCanvas: Canvas,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null
): Canvas {
  let scaledFrame = frameCanvas;
  if (frameCanvas.width !== outputWidth || frameCanvas.height !== outputHeight) {
    scaledFrame = createCanvas(outputWidth, outputHeight);
    const ctx = scaledFrame.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frameCanvas, 0, 0, outputWidth, outputHeight);
  }
  if (watermarkOpts) {
    scaledFrame = applyWatermarkServer(scaledFrame, watermarkOpts);
  }
  return scaledFrame;
}

async function renderQRFrameWithFallback(
  overlayInput: Canvas,
  frameIdx: number,
  isArtworkMode: boolean,
  generateArtworkFn: ((canvas: Canvas, idx: number) => Promise<Canvas>) | null,
  qrGenerator: QRGenerator,
  frameConfig: Record<string, unknown>
): Promise<Canvas> {
  if (isArtworkMode && generateArtworkFn) {
    try {
      return await generateArtworkFn(overlayInput, frameIdx);
    } catch (error_) {
      console.warn('[ARTWORK] frame render fallback', {
        frame: frameIdx,
        error: error_ instanceof Error ? error_.message : String(error_),
      });
      return await qrGenerator.generate(frameConfig, overlayInput);
    }
  }
  return await qrGenerator.generate(frameConfig, overlayInput);
}

function applyFrameInterpolation(
  currentCanvas: Canvas,
  previousCanvas: Canvas | null,
  interpolationMode: AnimationInterpolation
): Canvas {
  if ((interpolationMode === 'crossfade' || interpolationMode === 'morph') && previousCanvas) {
    return interpolateOverlayFramesServer(previousCanvas, currentCanvas, interpolationMode, 0.5);
  }
  return currentCanvas;
}

async function encodeOutputImage(
  outputFormat: OutputFormat,
  animatedOverlayFrames: ServerAnimationFrame[],
  animationFrameCanvases: Canvas[],
  outputCanvas: Canvas,
  gifColors: number,
  gifDisposalCode: number,
  gifBackgroundColor: string,
  transparent: boolean,
  animationSpeed: number,
  webpQuality: number,
  outputQuality: number,
  metadata: PngMetadata | undefined,
  outputDpi: number
): Promise<{ buffer: Buffer; contentType: string }> {
  switch (outputFormat) {
    case 'gif':
      if (animatedOverlayFrames.length > 1) {
        const tEncode = Date.now();
        const buffer = await withGifEncodeLock(() =>
          encodeAnimatedGifWithDelays(
            animatedOverlayFrames,
            gifColors,
            gifDisposalCode,
            gifBackgroundColor,
            transparent
          )
        );
        qrFnLog('[TIMING] GIF encoding', {
          frames: animatedOverlayFrames.length,
          encodeMs: Date.now() - tEncode,
          size: buffer.byteLength,
        });
        return { buffer, contentType: 'image/gif' };
      }
      if (animationFrameCanvases.length > 1) {
        const buffer = await withGifEncodeLock(() =>
          encodeAnimatedGif(
            animationFrameCanvases,
            animationSpeed,
            gifColors,
            gifDisposalCode,
            gifBackgroundColor,
            transparent
          )
        );
        return { buffer, contentType: 'image/gif' };
      }
      {
        const buffer = await withGifEncodeLock(() =>
          encodeGif(outputCanvas, gifColors, gifDisposalCode, gifBackgroundColor, transparent)
        );
        return { buffer, contentType: 'image/gif' };
      }

    case 'webp': {
      const finalWebpQuality = webpQuality === 90 ? Math.round(outputQuality * 100) : webpQuality;
      return {
        buffer: outputCanvas.toBuffer('image/webp', finalWebpQuality),
        contentType: 'image/webp',
      };
    }
    default: {
      let buffer = outputCanvas.toBuffer('image/png');
      if (metadata || outputDpi !== 72) {
        buffer = embedPngMetadataAndDpi(buffer, metadata, outputDpi);
      }
      return { buffer, contentType: 'image/png' };
    }
  }
}

interface OverlayLoadResult {
  overlayCanvas: Canvas | null;
  overlayFrames: ServerAnimationFrame[];
  hasAnimatedOverlay: boolean;
  outputFormat: OutputFormat;
}

interface OverlayFilterOptions {
  brightness: number;
  contrast: number;
  gamma: number;
  saturation: number;
  hue: number;
  invert: boolean;
  blur: number;
  sharpen: number;
  posterize: number;
  threshold?: number;
  edge: 'off' | 'sobel' | 'canny';
}

function preprocessOverlayCanvas(
  canvas: Canvas,
  cropEnabled: boolean,
  cropX: number,
  cropY: number,
  cropSize: number,
  overlayRotate: number,
  overlayFlipX: boolean,
  overlayFlipY: boolean,
  hasFilters: boolean,
  filterOptions: OverlayFilterOptions
): Canvas {
  let processed = canvas;
  if (cropEnabled && cropSize < 1) {
    processed = cropOverlayServer(processed, cropX, cropY, cropSize);
  }
  if (overlayRotate !== 0) {
    processed = rotateOverlayServer(processed, overlayRotate);
  }
  if (overlayFlipX || overlayFlipY) {
    processed = flipOverlayServer(processed, overlayFlipX, overlayFlipY);
  }
  if (hasFilters) {
    processed = applyOverlayFiltersServer(processed, filterOptions);
  }
  return processed;
}

function hasActiveOverlayFilters(f: OverlayFilterOptions): boolean {
  return (
    f.brightness !== 0 ||
    f.contrast !== 0 ||
    f.gamma !== 1 ||
    f.saturation !== 0 ||
    f.hue !== 0 ||
    f.invert ||
    f.blur > 0 ||
    f.sharpen > 0 ||
    f.posterize > 1 ||
    f.edge !== 'off'
  );
}

function processAnimatedGifFrames(
  fetchedImage: FetchedImage,
  gifDisposalHandling: string,
  gifMaxFps: number,
  preprocess: (c: Canvas) => Canvas
): { overlayCanvas: Canvas; overlayFrames: ServerAnimationFrame[] } {
  const tParse = Date.now();
  let rawFrames = parseGifFramesServer(
    fetchedImage.arrayBuffer,
    gifDisposalHandling === 'simplify' ? 'simplify' : 'respect'
  );
  qrFnLog('[TIMING] GIF frame parsing', {
    frames: rawFrames.length,
    parseMs: Date.now() - tParse,
  });

  if (rawFrames.length > SERVER_MAX_ANIMATION_FRAMES) {
    qrFnLog('[TIMING] limiting frames', {
      from: rawFrames.length,
      to: SERVER_MAX_ANIMATION_FRAMES,
    });
    rawFrames = decimateFramesToMaxCount(rawFrames, SERVER_MAX_ANIMATION_FRAMES);
  }

  const tPreprocess = Date.now();
  let overlayFrames = rawFrames.map((frame) => ({
    ...frame,
    canvas: preprocess(frame.canvas),
  }));
  qrFnLog('[TIMING] frame preprocessing', {
    frames: overlayFrames.length,
    preprocessMs: Date.now() - tPreprocess,
  });
  if (gifMaxFps > 0 && overlayFrames.length > 1 && !Number.isNaN(gifMaxFps)) {
    overlayFrames = decimateFramesToMaxFps(overlayFrames, gifMaxFps);
  }
  const overlayCanvas = overlayFrames[0]?.canvas ?? preprocess(fetchedImage.canvas);
  return { overlayCanvas, overlayFrames };
}

async function loadAndPreprocessOverlay(
  overlayUrl: string | null,
  overlayMode: string | undefined,
  isFullRender: boolean,
  strictOverlay: boolean,
  explicitFormat: string | null,
  currentOutputFormat: OutputFormat,
  cropEnabled: boolean,
  cropX: number,
  cropY: number,
  cropSize: number,
  overlayRotate: number,
  overlayFlipX: boolean,
  overlayFlipY: boolean,
  filterOptions: OverlayFilterOptions,
  gifDisposalHandling: string,
  gifMaxFps: number
): Promise<OverlayLoadResult | Response> {
  if (!overlayUrl || !overlayMode || !isFullRender) {
    return {
      overlayCanvas: null,
      overlayFrames: [],
      hasAnimatedOverlay: false,
      outputFormat: currentOutputFormat,
    };
  }

  const tOverlayFetch = Date.now();
  const fetchedImage = await fetchImageWithBuffer(overlayUrl);
  qrFnLog('[TIMING] overlay fetch', {
    url: overlayUrl.slice(0, 80),
    fetchMs: Date.now() - tOverlayFetch,
    ok: !!fetchedImage,
  });

  if (!fetchedImage) {
    if (strictOverlay) {
      return new Response('Strict overlay mode failed to fetch/decode overlay', {
        status: 502,
        headers: CORS_HEADERS,
      });
    }
    return {
      overlayCanvas: null,
      overlayFrames: [],
      hasAnimatedOverlay: false,
      outputFormat: currentOutputFormat,
    };
  }

  const strictAnimatedGif =
    strictOverlay && overlayUrl.split('?')[0].toLowerCase().endsWith('.gif');
  if (strictAnimatedGif && !fetchedImage.isAnimatedGif) {
    return new Response('Strict overlay mode expected animated GIF frames', {
      status: 502,
      headers: CORS_HEADERS,
    });
  }

  const hasFilters = hasActiveOverlayFilters(filterOptions);
  const preprocess = (c: Canvas) =>
    preprocessOverlayCanvas(
      c,
      cropEnabled,
      cropX,
      cropY,
      cropSize,
      overlayRotate,
      overlayFlipX,
      overlayFlipY,
      hasFilters,
      filterOptions
    );

  if (fetchedImage.isAnimatedGif) {
    const outputFormat = explicitFormat ? currentOutputFormat : ('gif' as OutputFormat);
    const { overlayCanvas, overlayFrames } = processAnimatedGifFrames(
      fetchedImage,
      gifDisposalHandling,
      gifMaxFps,
      preprocess
    );
    return { overlayCanvas, overlayFrames, hasAnimatedOverlay: true, outputFormat };
  }

  // Static overlay
  const outputFormat = explicitFormat ? currentOutputFormat : ('png' as OutputFormat);
  return {
    overlayCanvas: preprocess(fetchedImage.canvas),
    overlayFrames: [],
    hasAnimatedOverlay: false,
    outputFormat,
  };
}

interface ArtworkState {
  lockedMask: number;
  lockedVersion: number;
}

async function generateArtworkFrame(
  targetCanvas: Canvas,
  frameIdx: number,
  normalizeRenderStyles: boolean,
  state: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: 'auto' | number,
  config: Record<string, unknown>,
  qrGenerator: QRGenerator
): Promise<Canvas> {
  const useAutoMask = typeof maskPattern !== 'number' || maskPattern < 0;
  const qartConfig = {
    data,
    targetImage: targetCanvas as unknown as ImageData,
    version: state.lockedVersion,
    ecc: ec,
    strictSuffix: true,
    targetControlPercent: 100,
    lockVersionToMinimum: version === 0 && frameIdx === 0,
  };

  const qartResult =
    useAutoMask && state.lockedMask < 0
      ? await generateFullQArtOptimal(qartConfig)
      : await generateFullQArt({
          ...qartConfig,
          maskPattern: state.lockedMask >= 0 ? state.lockedMask : (maskPattern as number),
        });

  if (!(qartResult.success && qartResult.matrix)) {
    throw new Error(qartResult.error || 'QR-Art generation failed');
  }

  if (frameIdx === 0) {
    state.lockedMask = qartResult.maskPattern;
    state.lockedVersion = qartResult.version;
  }

  const qrArtConfig = {
    ...config,
    typeNumber: qartResult.version,
    overlayMode: undefined,
  };
  if (normalizeRenderStyles) {
    Object.assign(qrArtConfig, {
      moduleStyle: 'square',
      finderStyle: 'square',
      alignmentStyle: 'square',
      timingStyle: 'square',
      eyeOuterStyle: 'square',
      eyeInnerStyle: 'square',
      moduleGap: 0,
      gapMode: 'none',
      cornerRadius: 0,
    });
  }

  return (await qrGenerator.renderFromMatrix(qartResult.matrix, qrArtConfig)) as Canvas;
}

function buildAnimationEffectArrays(
  primaryEffect: AnimationEffectConfig,
  secondaryEffect: AnimationEffectConfig,
  temporalDither: AnimationTemporalDitherMode
): {
  animationEffects: AnimationEffectConfig[];
  moduleAnimationEffects: AnimationEffectConfig[];
  resultAnimationEffects: AnimationEffectConfig[];
  hasAnyAnimationEffects: boolean;
} {
  const animationEffects: AnimationEffectConfig[] = [];
  if (hasAnimationEffect(primaryEffect)) {
    animationEffects.push(primaryEffect);
  }
  if (hasAnimationEffect(secondaryEffect)) {
    animationEffects.push(secondaryEffect);
  }
  const moduleAnimationEffects = animationEffects.filter(
    (effect) => effect.target === 'modules' || effect.target === 'both'
  );
  const resultAnimationEffects = animationEffects.filter(
    (effect) => effect.target === 'result' || effect.target === 'both'
  );
  return {
    animationEffects,
    moduleAnimationEffects,
    resultAnimationEffects,
    hasAnyAnimationEffects: animationEffects.length > 0 || temporalDither !== 'off',
  };
}

function applyResultEffectsForFrameHelper(
  sourceCanvas: Canvas,
  frameIndex: number,
  totalFrames: number,
  resultAnimationEffects: AnimationEffectConfig[],
  temporalDither: AnimationTemporalDitherMode,
  animSeed: number,
  isArtwork: boolean
): Canvas {
  let frame = applyAnimationEffectsToCanvasServer(
    sourceCanvas,
    resultAnimationEffects,
    frameIndex,
    totalFrames
  );
  if (temporalDither !== 'off') {
    const temporalOffset = calculateTemporalOffsetServer(frameIndex, temporalDither, animSeed);
    const temporalStrength = isArtwork ? 0.004 : 0.012;
    frame = applyTemporalNoiseToCanvasServer(frame, temporalOffset, temporalStrength);
  }
  return frame;
}

function buildPngMetadata(
  metaTitle: string | undefined,
  metaAuthor: string | undefined,
  metaCopyright: string | undefined,
  metaDescription: string | undefined,
  metaLicense: string | undefined,
  metaCreationTime: boolean,
  metaCustomKv: string | undefined
): PngMetadata | undefined {
  if (
    !metaTitle &&
    !metaAuthor &&
    !metaCopyright &&
    !metaDescription &&
    !metaLicense &&
    !metaCreationTime &&
    !metaCustomKv
  ) {
    return undefined;
  }
  return {
    title: metaTitle,
    author: metaAuthor,
    copyright: metaCopyright,
    description: metaDescription,
    creationTime: metaCreationTime ? new Date().toISOString() : undefined,
    software: 'ANQR - anqr.link',
    ...(metaCustomKv && !metaDescription ? { description: metaCustomKv } : {}),
  };
}

function parseMaskPattern(param: string | null): 'auto' | number {
  if (!param || param === 'auto') return 'auto';
  const parsed = Number.parseInt(param, 10);
  if (Number.isNaN(parsed)) return 'auto';
  return Math.min(7, Math.max(0, parsed));
}

function parseGifDisposalCode(disposal: string): number {
  if (disposal === 'none') return 0;
  if (disposal === 'keep') return 1;
  if (disposal === 'restore_previous') return 3;
  return 2;
}

async function loadWatermarkImage(
  watermarkEnabled: boolean,
  watermarkKind: WatermarkKind,
  watermarkImageUrl: string | undefined
): Promise<Canvas | null> {
  if (
    watermarkEnabled &&
    (watermarkKind === 'image' || watermarkKind === 'pattern') &&
    watermarkImageUrl
  ) {
    return fetchImageAsCanvas(watermarkImageUrl);
  }
  return null;
}

function scaleToOutputDimensions(
  canvas: Canvas,
  outputWidth: number,
  outputHeight: number
): Canvas {
  if (canvas.width === outputWidth && canvas.height === outputHeight) {
    return canvas;
  }
  const outputCanvas = createCanvas(outputWidth, outputHeight);
  const ctx = outputCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, outputWidth, outputHeight);
  return outputCanvas;
}

async function renderAnimatedOverlayLoop(
  overlayFrames: ServerAnimationFrame[],
  isArtworkMode: boolean,
  moduleAnimationEffects: AnimationEffectConfig[],
  resultAnimationEffects: AnimationEffectConfig[],
  animationInterpolate: AnimationInterpolation,
  animationTemporalDither: AnimationTemporalDitherMode,
  animationSeed: number,
  animationModuleJitter: number,
  config: Record<string, unknown>,
  totalMargin: number,
  estimatedModuleCount: number,
  artworkState: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: 'auto' | number,
  qrGenerator: QRGenerator,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null,
  gifDisposalCode: number
): Promise<ServerAnimationFrame[]> {
  const ANIM_RENDER_SIZE = 240;
  const animModuleSize = Math.max(
    1,
    Math.floor((ANIM_RENDER_SIZE - totalMargin * 2) / (estimatedModuleCount + totalMargin * 2))
  );
  const animRenderScale = Math.max(1, Math.round(ANIM_RENDER_SIZE / estimatedModuleCount));
  const animConfig = {
    ...config,
    moduleSize: animModuleSize,
    renderScalePerModule: animRenderScale,
    renderScaleMinimum: 1,
  };
  let previousRawModuleInput: Canvas | null = null;
  let previousRenderedOutput: Canvas | null = null;
  const tAnimStart = Date.now();
  qrFnLog('[ANIMATION] starting animated overlay', {
    frames: overlayFrames.length,
    renderSize: ANIM_RENDER_SIZE,
    animModuleSize,
    animRenderScale,
    outputSize: `${outputWidth}x${outputHeight}`,
    moduleEffects: moduleAnimationEffects.length,
    resultEffects: resultAnimationEffects.length,
  });

  const result: ServerAnimationFrame[] = [];
  for (let i = 0; i < overlayFrames.length; i++) {
    const tFrame = Date.now();
    const overlayFrame = overlayFrames[i];
    let moduleOverlayInput = isArtworkMode
      ? overlayFrame.canvas
      : applyAnimationEffectsToCanvasServer(
          overlayFrame.canvas,
          moduleAnimationEffects,
          i,
          overlayFrames.length
        );

    const rawModuleInput = moduleOverlayInput;
    moduleOverlayInput = applyFrameInterpolation(
      moduleOverlayInput,
      previousRawModuleInput,
      animationInterpolate
    );
    previousRawModuleInput = rawModuleInput;

    const frameConfig = applyModuleAnimationToConfigServer(
      animConfig as Record<string, unknown>,
      moduleAnimationEffects,
      i,
      overlayFrames.length,
      animationModuleJitter
    ) as typeof config;

    let frameCanvas = await renderQRFrameWithFallback(
      moduleOverlayInput,
      i,
      isArtworkMode,
      (target, idx, normalize) =>
        generateArtworkFrame(
          target,
          idx,
          normalize,
          artworkState,
          data,
          ec,
          version,
          maskPattern,
          config,
          qrGenerator
        ),
      qrGenerator,
      frameConfig
    );

    frameCanvas = applyResultEffectsForFrameHelper(
      frameCanvas,
      i,
      overlayFrames.length,
      resultAnimationEffects,
      animationTemporalDither,
      animationSeed,
      isArtworkMode
    );
    frameCanvas = applyFrameInterpolation(
      frameCanvas,
      previousRenderedOutput,
      animationInterpolate
    );
    previousRenderedOutput = frameCanvas;

    if (i > 0 && i % 3 === 0) {
      await sleep(1);
    }
    if (i % 10 === 0 || i === overlayFrames.length - 1) {
      qrFnLog('[ANIMATION] frame progress', {
        frame: i + 1,
        total: overlayFrames.length,
        frameMs: Date.now() - tFrame,
        elapsedMs: Date.now() - tAnimStart,
      });
    }

    result.push({
      canvas: scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts),
      delay: overlayFrame.delay,
      disposalType: gifDisposalCode,
    });
  }
  qrFnLog('[ANIMATION] all frames rendered', {
    frames: result.length,
    totalMs: Date.now() - tAnimStart,
  });
  return result;
}

async function renderPatternAnimationLoop(
  overlayCanvas: Canvas | null,
  isArtworkMode: boolean,
  moduleAnimationEffects: AnimationEffectConfig[],
  resultAnimationEffects: AnimationEffectConfig[],
  animationInterpolate: AnimationInterpolation,
  animationTemporalDither: AnimationTemporalDitherMode,
  animationSeed: number,
  animationModuleJitter: number,
  totalAnimFrames: number,
  config: Record<string, unknown>,
  artworkState: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: 'auto' | number,
  qrGenerator: QRGenerator,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null
): Promise<Canvas[]> {
  const result: Canvas[] = [];
  let previousRawModuleInput: Canvas | null = null;
  let previousRenderedOutput: Canvas | null = null;
  for (let i = 0; i < totalAnimFrames; i++) {
    let moduleOverlayInput = overlayCanvas;
    if (moduleOverlayInput && moduleAnimationEffects.length > 0 && !isArtworkMode) {
      moduleOverlayInput = applyAnimationEffectsToCanvasServer(
        moduleOverlayInput,
        moduleAnimationEffects,
        i,
        totalAnimFrames
      );
    }

    if (moduleOverlayInput) {
      moduleOverlayInput = applyFrameInterpolation(
        moduleOverlayInput,
        previousRawModuleInput,
        animationInterpolate
      );
      previousRawModuleInput = moduleOverlayInput;
    }

    const frameConfig = applyModuleAnimationToConfigServer(
      config as Record<string, unknown>,
      moduleAnimationEffects,
      i,
      totalAnimFrames,
      animationModuleJitter
    ) as typeof config;

    const artworkTarget = (moduleOverlayInput || overlayCanvas) as Canvas;
    let frameCanvas = await renderQRFrameWithFallback(
      artworkTarget,
      i,
      isArtworkMode && !!artworkTarget,
      (target, idx, normalize) =>
        generateArtworkFrame(
          target,
          idx,
          normalize,
          artworkState,
          data,
          ec,
          version,
          maskPattern,
          config,
          qrGenerator
        ),
      qrGenerator,
      frameConfig as Record<string, unknown>
    );

    frameCanvas = applyResultEffectsForFrameHelper(
      frameCanvas,
      i,
      totalAnimFrames,
      resultAnimationEffects,
      animationTemporalDither,
      animationSeed,
      isArtworkMode
    );
    frameCanvas = applyFrameInterpolation(
      frameCanvas,
      previousRenderedOutput,
      animationInterpolate
    );
    previousRenderedOutput = frameCanvas;

    result.push(scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts));
  }
  return result;
}

interface ParsedHandlerParams {
  data: string;
  isFullRender: boolean;
  strictOverlay: boolean;
  skipCache: boolean;
  outputWidth: number;
  outputHeight: number;
  size: number;
  fg: string;
  bg: string;
  ec: ECCLevel;
  margin: number;
  transparent: boolean;
  encodingMode: string;
  version: number;
  maskPattern: 'auto' | number;
  characterEncoding: string;
  borderModulesExtra: number;
  quietZoneMinEnforce: boolean | undefined;
  crispEdges: boolean;
  pixelSnap: string;
  perModuleColorMode: string;
  contrastGuard: boolean;
  minContrastRatio: number;
  renderSeed: number | undefined;
  moduleStyle: string;
  finderStyle: string;
  eyeOuterStyle: string;
  eyeInnerStyle: string;
  eyeScale: number;
  cornerRadius: number;
  moduleGap: number;
  gapMode: string;
  dotRotationDeg: number;
  frameStyle: string;
  frameText: string;
  gradientType: string;
  gradientAngle: number;
  gradientStops: Array<{ pos: number; color: string }> | undefined;
  alignmentStyle: string;
  timingStyle: string;
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormatInfo: boolean;
  protectVersionInfo: boolean;
  eccAwareEnabled: boolean;
  eccAwareRiskBudget: number;
  eccAwareWeightMap: string;
  overlayUrl: string | null;
  overlayMode: string | undefined;
  overlayIntensity: number;
  colorMode: string;
  logoSize: number;
  overlayBrightness: number;
  overlayContrast: number;
  overlayGamma: number;
  overlaySaturation: number;
  overlayHueRotate: number;
  overlayInvert: boolean;
  overlayBlur: number;
  overlaySharpen: number;
  overlayPosterize: number;
  overlayThreshold: number | undefined;
  overlayEdgeDetect: string;
  overlayFit: string;
  overlayRotate: number;
  overlayFlipX: boolean;
  overlayFlipY: boolean;
  ditherKind: DitherKind;
  diffusionKernel: string;
  ditherStrength: number;
  finderDitherStrength: number;
  blendPreservations: boolean;
  blendPreservationMode: string;
  ditherSerpentine: boolean;
  orderedMatrix: string;
  blueNoiseTileSize: number;
  blueNoiseSeed: number;
  colorDither: string;
  subpixelGridSize: string;
  subpixelGridNum: number | undefined;
  subpixelCenterRule: string;
  subpixelNeutralColor: string;
  subpixelFinderOverride: string;
  halftoneCell: string;
  halftoneDotShape: string;
  brightnessCurve: string;
  duotoneColor1: string;
  duotoneColor2: string;
  palette: string[] | undefined;
  paletteMode: string;
  maxOverlayIntensityL: number;
  maxOverlayIntensityM: number;
  maxOverlayIntensityQ: number;
  maxOverlayIntensityH: number;
  explicitFormat: string | null;
  outputFormat: OutputFormat;
  outputQuality: number;
  outputDpi: number;
  watermarkEnabled: boolean;
  watermarkKind: WatermarkKind;
  watermarkText: string;
  watermarkImageUrl: string | undefined;
  watermarkPosition: WatermarkPosition;
  watermarkOpacity: number;
  watermarkBlend: WatermarkBlend;
  animationPattern: AnimationPattern;
  animationPattern2: AnimationPattern;
  animationLoop: boolean;
  animationBounce: boolean;
  animationReverse: boolean;
  animationColorCycle: boolean;
  animationTarget: AnimationTarget;
  animationWaveAxis: AnimationWaveAxis;
  animationBounce2: boolean;
  animationReverse2: boolean;
  animationColorCycle2: boolean;
  animationTarget2: AnimationTarget;
  animationWaveAxis2: AnimationWaveAxis;
  animationInterpolate: AnimationInterpolation;
  animationTemporalDither: AnimationTemporalDitherMode;
  animationModuleJitter: number;
  animationFrames: number;
  animationSpeed: number;
  animationSeed: number;
  animationSeed2: number;
  animationEasing: AnimationEasing;
  animationEasing2: AnimationEasing;
  animationStartFrame: number;
  animationMaxFrames: number;
  animationFrameStep: number;
  webpQuality: number;
  gifColors: number;
  metaTitle: string | undefined;
  metaAuthor: string | undefined;
  metaCopyright: string | undefined;
  metaDescription: string | undefined;
  metaLicense: string | undefined;
  metaCreationTime: boolean;
  metaCustomKv: string | undefined;
  cropEnabled: boolean;
  cropX: number;
  cropY: number;
  cropSize: number;
  overlayType: string;
  overlayFramePick: string;
  gifUseFrameDelays: boolean;
  gifDisposalHandling: string;
  gifMaxFps: number;
  lockFinders: boolean;
  lockTiming: boolean;
  lockAlign: boolean;
  lockFormat: boolean;
  lockVersion: boolean;
  safetyMode: string;
  safetyMinModulePx: number;
  safetyMinQuietZone: number;
  autoPickVersion: boolean;
  autoPickEcc: boolean;
  autoReduceIntensity: boolean;
  bgOverride: string | undefined;
  formatExtra: string;
  filename: string;
  includeQuietZone: boolean;
  gifDisposalCode: number;
  svgShapePrecision: string;
  svgEmbedRasterOverlay: boolean;
  modulePxParam: number | null;
}

function parseCoreQRParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'data'
  | 'isFullRender'
  | 'strictOverlay'
  | 'outputWidth'
  | 'outputHeight'
  | 'size'
  | 'fg'
  | 'bg'
  | 'ec'
  | 'margin'
  | 'transparent'
  | 'encodingMode'
  | 'version'
  | 'maskPattern'
  | 'characterEncoding'
  | 'borderModulesExtra'
  | 'quietZoneMinEnforce'
  | 'crispEdges'
  | 'pixelSnap'
  | 'perModuleColorMode'
  | 'contrastGuard'
  | 'minContrastRatio'
  | 'renderSeed'
  | 'modulePxParam'
> {
  const sizeParam = Number.parseInt(params.get('size') || '400', 10);
  const modulePxParam = params.get('modulePx')
    ? Number.parseInt(params.get('modulePx')!, 10)
    : null;
  const widthParam = params.get('w') ? Number.parseInt(params.get('w')!, 10) : null;
  const heightParam = params.get('h') ? Number.parseInt(params.get('h')!, 10) : null;
  const outputWidth = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, widthParam ?? sizeParam));
  const outputHeight = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, heightParam ?? sizeParam));
  const size = Math.max(outputWidth, outputHeight);
  const charsetParam = params.get('charset') || 'default';
  const lang = params.get('lang') || undefined;
  void lang; // NOSONAR - intentional void to suppress floating promise
  return {
    data: params.get('data') || '',
    isFullRender: params.get('_fullRender') === '1',
    strictOverlay: params.get('_strictOverlay') === '1',
    outputWidth,
    outputHeight,
    size,
    modulePxParam,
    fg: params.get('fg') || '000000',
    bg: params.get('bg') || 'ffffff',
    ec: (params.get('ec')?.toUpperCase() || 'H') as ECCLevel,
    margin: Math.min(20, Math.max(0, Number.parseInt(params.get('margin') || '4', 10))),
    transparent: params.get('transparent') === '1',
    encodingMode: params.get('enc') || 'auto',
    version: params.get('v') ? Number.parseInt(params.get('v')!, 10) : 0,
    maskPattern: parseMaskPattern(params.get('mask')),
    characterEncoding: ['default', 'utf8', 'shift-jis'].includes(charsetParam)
      ? charsetParam
      : 'default',
    borderModulesExtra: Math.min(10, Math.max(0, Number.parseInt(params.get('border') || '0', 10))),
    quietZoneMinEnforce: params.has('qzEnforce') ? params.get('qzEnforce') !== '0' : undefined,
    crispEdges: params.get('crisp') !== '0',
    pixelSnap: params.get('snap') || 'floor',
    perModuleColorMode: params.get('modColor') || 'solid',
    contrastGuard: params.get('cGuard') === '1',
    minContrastRatio: Number.parseFloat(params.get('minContrast') || '4.5'),
    renderSeed: params.get('seed') ? Number.parseInt(params.get('seed') || '0', 10) : undefined,
  };
}

function parseStylingParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'moduleStyle'
  | 'finderStyle'
  | 'eyeOuterStyle'
  | 'eyeInnerStyle'
  | 'eyeScale'
  | 'cornerRadius'
  | 'moduleGap'
  | 'gapMode'
  | 'dotRotationDeg'
  | 'frameStyle'
  | 'frameText'
  | 'gradientType'
  | 'gradientAngle'
  | 'gradientStops'
  | 'alignmentStyle'
  | 'timingStyle'
  | 'palette'
  | 'paletteMode'
> {
  const finderStyle = params.get('finder') || 'square';
  const gradientStopsParam = params.get('gradStops');
  const paletteParam = params.get('palette');
  return {
    moduleStyle: params.get('style') || 'square',
    finderStyle,
    eyeOuterStyle: params.get('eyeOuter') || finderStyle,
    eyeInnerStyle: params.get('eyeInner') || finderStyle,
    eyeScale: Math.min(150, Math.max(50, Number.parseInt(params.get('eyeScale') || '100', 10))),
    cornerRadius: Math.min(100, Math.max(0, Number.parseInt(params.get('radius') || '0', 10))),
    moduleGap: Math.min(50, Math.max(0, Number.parseInt(params.get('gap') || '0', 10))),
    gapMode: params.get('gapMode') || 'none',
    dotRotationDeg: Number.parseInt(params.get('dotRot') || '0', 10),
    frameStyle: params.get('frame') || 'none',
    frameText: params.get('frameText') || '',
    gradientType: params.get('grad') || 'none',
    gradientAngle: Number.parseInt(params.get('gradAngle') || '0', 10),
    gradientStops: gradientStopsParam ? parseGradientStops(gradientStopsParam) : undefined,
    alignmentStyle: params.get('align') || 'match_finder',
    timingStyle: params.get('timing') || 'match_module',
    palette: paletteParam
      ? paletteParam.split(',').map((c) => (c.startsWith('#') ? c : `#${c}`))
      : undefined,
    paletteMode: params.get('paletteMode') || 'position',
  };
}

function parseProtectionParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'preserveFinders'
  | 'preserveTiming'
  | 'preserveAlignment'
  | 'protectFormatInfo'
  | 'protectVersionInfo'
  | 'eccAwareEnabled'
  | 'eccAwareRiskBudget'
  | 'eccAwareWeightMap'
  | 'lockFinders'
  | 'lockTiming'
  | 'lockAlign'
  | 'lockFormat'
  | 'lockVersion'
  | 'safetyMode'
  | 'safetyMinModulePx'
  | 'safetyMinQuietZone'
  | 'autoPickVersion'
  | 'autoPickEcc'
  | 'autoReduceIntensity'
> {
  void params.get('qaContrast'); // NOSONAR - intentional void to suppress floating promise
  void params.get('qaBlur'); // NOSONAR - intentional void to suppress floating promise
  void params.get('qaNoise'); // NOSONAR - intentional void to suppress floating promise
  void params.get('qaRot'); // NOSONAR - intentional void to suppress floating promise
  void params.get('qaHeatmap'); // NOSONAR - intentional void to suppress floating promise
  return {
    preserveFinders: params.get('keepFinders') !== '0',
    preserveTiming: params.get('keepTiming') === '1',
    preserveAlignment: params.get('keepAlign') === '1',
    protectFormatInfo: params.get('protectFmt') === '1',
    protectVersionInfo: params.get('protectVer') === '1',
    eccAwareEnabled: params.get('eccAware') === '1',
    eccAwareRiskBudget: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get('eccRisk') || '50', 10))
    ),
    eccAwareWeightMap: params.get('eccMap') || 'distance_to_finders',
    lockFinders: params.get('lockF') !== '0',
    lockTiming: params.get('lockT') !== '0',
    lockAlign: params.get('lockA') !== '0',
    lockFormat: params.get('lockFmt') !== '0',
    lockVersion: params.get('lockV') !== '0',
    safetyMode: params.get('safeMode') || 'off',
    safetyMinModulePx: Number.parseInt(params.get('safeMinPx') || '2', 10),
    safetyMinQuietZone: Number.parseInt(params.get('safeMinQz') || '4', 10),
    autoPickVersion: params.get('autoVer') !== '0',
    autoPickEcc: params.get('autoEcc') === '1',
    autoReduceIntensity: params.get('autoReduce') === '1',
  };
}

function parseOverlayParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'overlayUrl'
  | 'overlayMode'
  | 'overlayIntensity'
  | 'colorMode'
  | 'logoSize'
  | 'overlayBrightness'
  | 'overlayContrast'
  | 'overlayGamma'
  | 'overlaySaturation'
  | 'overlayHueRotate'
  | 'overlayInvert'
  | 'overlayBlur'
  | 'overlaySharpen'
  | 'overlayPosterize'
  | 'overlayThreshold'
  | 'overlayEdgeDetect'
  | 'overlayFit'
  | 'overlayRotate'
  | 'overlayFlipX'
  | 'overlayFlipY'
  | 'cropEnabled'
  | 'cropX'
  | 'cropY'
  | 'cropSize'
  | 'overlayType'
  | 'overlayFramePick'
  | 'gifUseFrameDelays'
  | 'gifDisposalHandling'
  | 'gifMaxFps'
> {
  const overlayUrl = params.get('img');
  const legacySubpixel = params.get('subpixel') === '1';
  const overlayThresholdParam = params.get('threshold');
  return {
    overlayUrl,
    overlayMode:
      params.get('mode') || (legacySubpixel ? 'subpixel' : overlayUrl ? 'dithered' : undefined),
    overlayIntensity: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get('intensity') || '100', 10))
    ),
    colorMode: params.get('colorMode') || 'color',
    logoSize: Math.min(50, Math.max(5, Number.parseInt(params.get('logoSize') || '25', 10))),
    overlayBrightness: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get('brightness') || '0', 10))
    ),
    overlayContrast: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get('contrast') || '0', 10))
    ),
    overlayGamma: Math.max(0.1, Math.min(3, Number.parseFloat(params.get('gamma') || '1'))),
    overlaySaturation: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get('saturation') || '0', 10))
    ),
    overlayHueRotate: Number.parseInt(params.get('hue') || '0', 10),
    overlayInvert: params.get('invert') === '1',
    overlayBlur: Math.max(0, Number.parseInt(params.get('blur') || '0', 10)),
    overlaySharpen: Math.max(0, Number.parseInt(params.get('sharpen') || '0', 10)),
    overlayPosterize: Math.max(0, Number.parseInt(params.get('posterize') || '0', 10)),
    overlayThreshold: overlayThresholdParam
      ? Math.min(255, Math.max(0, Number.parseInt(overlayThresholdParam, 10)))
      : undefined,
    overlayEdgeDetect: params.get('edge') || 'off',
    overlayFit: params.get('fit') || 'cover',
    overlayRotate: Number.parseInt(params.get('rot') || '0', 10),
    overlayFlipX: params.get('flipX') === '1',
    overlayFlipY: params.get('flipY') === '1',
    cropEnabled: params.get('cropEn') === '1',
    cropX: Number.parseFloat(params.get('cropX') || '0.5'),
    cropY: Number.parseFloat(params.get('cropY') || '0.5'),
    cropSize: Number.parseFloat(params.get('cropSize') || '1'),
    overlayType: params.get('ovType') || 'static',
    overlayFramePick: params.get('ovFramePick') || 'all',
    gifUseFrameDelays: params.get('gifDelays') !== '0',
    gifDisposalHandling: params.get('gifDispH') || 'respect',
    gifMaxFps: Number.parseInt(params.get('gifMaxFps') || '0', 10),
  };
}

function parseDitherParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'ditherKind'
  | 'diffusionKernel'
  | 'ditherStrength'
  | 'finderDitherStrength'
  | 'blendPreservations'
  | 'blendPreservationMode'
  | 'ditherSerpentine'
  | 'orderedMatrix'
  | 'blueNoiseTileSize'
  | 'blueNoiseSeed'
  | 'colorDither'
  | 'subpixelGridSize'
  | 'subpixelGridNum'
  | 'subpixelCenterRule'
  | 'subpixelNeutralColor'
  | 'subpixelFinderOverride'
  | 'halftoneCell'
  | 'halftoneDotShape'
  | 'brightnessCurve'
  | 'duotoneColor1'
  | 'duotoneColor2'
> {
  return {
    ditherKind: (params.get('ditherKind') || DEFAULT_SERVER_DITHER) as DitherKind,
    diffusionKernel: params.get('diffusionKernel') || 'floyd_steinberg',
    ditherStrength: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get('ditherStrength') || '50', 10))
    ),
    finderDitherStrength: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get('finderDither') || '65', 10))
    ),
    blendPreservations: params.get('blendPres') === '1',
    blendPreservationMode: params.get('blendPresMode') === 'dither' ? 'dither' : 'overlay',
    ditherSerpentine: params.get('serpentine') === '1',
    orderedMatrix: params.get('matrix') || 'bayer4',
    blueNoiseTileSize: Number.parseInt(params.get('bnTile') || '64', 10),
    blueNoiseSeed: Number.parseInt(params.get('bnSeed') || '0', 10),
    colorDither: params.get('colorDither') || 'none',
    subpixelGridSize: params.get('spGrid') || '3x3',
    subpixelGridNum: params.get('spGridNum')
      ? Number.parseInt(params.get('spGridNum') || '3', 10)
      : undefined,
    subpixelCenterRule: params.get('spCenter') || 'strict',
    subpixelNeutralColor: params.get('spNeutral') ? `#${params.get('spNeutral')}` : '#808080',
    subpixelFinderOverride: params.get('spFinder') || 'solid',
    halftoneCell: params.get('htCell') || 'per_module',
    halftoneDotShape: params.get('htDot') || 'circle',
    brightnessCurve: params.get('htCurve') || 'linear',
    duotoneColor1: params.get('duo1') ? `#${params.get('duo1')}` : '#000000',
    duotoneColor2: params.get('duo2') ? `#${params.get('duo2')}` : '#ffffff',
  };
}

function parseOutputParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'explicitFormat'
  | 'outputFormat'
  | 'outputQuality'
  | 'outputDpi'
  | 'webpQuality'
  | 'gifColors'
  | 'maxOverlayIntensityL'
  | 'maxOverlayIntensityM'
  | 'maxOverlayIntensityQ'
  | 'maxOverlayIntensityH'
  | 'watermarkEnabled'
  | 'watermarkKind'
  | 'watermarkText'
  | 'watermarkImageUrl'
  | 'watermarkPosition'
  | 'watermarkOpacity'
  | 'watermarkBlend'
  | 'metaTitle'
  | 'metaAuthor'
  | 'metaCopyright'
  | 'metaDescription'
  | 'metaLicense'
  | 'metaCreationTime'
  | 'metaCustomKv'
  | 'bgOverride'
  | 'formatExtra'
  | 'filename'
  | 'includeQuietZone'
  | 'gifDisposalCode'
  | 'svgShapePrecision'
  | 'svgEmbedRasterOverlay'
> {
  const explicitFormat = params.get('format');
  const gifPaletteSize = params.get('gifPal');
  const _jpegQuality = Math.min(100, Math.max(0, Number.parseInt(params.get('jpegQ') || '92', 10)));
  const gifQuantizer = params.get('gifQuant') || undefined;
  const gifDither = params.get('gifDith') || undefined;
  const gifTransparentColor = params.get('gifTrans') ? `#${params.get('gifTrans')}` : undefined;
  const svgTrueVector = params.get('svgVec') === '1';
  void _jpegQuality; // NOSONAR - intentional void to suppress floating promise
  void gifQuantizer; // NOSONAR - intentional void to suppress floating promise
  void gifDither; // NOSONAR - intentional void to suppress floating promise
  void gifTransparentColor; // NOSONAR - intentional void to suppress floating promise
  void svgTrueVector; // NOSONAR - intentional void to suppress floating promise
  return {
    explicitFormat,
    outputFormat: (explicitFormat || DEFAULT_OUTPUT_FORMAT) as OutputFormat,
    outputQuality: Math.max(0, Math.min(1, Number.parseFloat(params.get('quality') || '0.9'))),
    outputDpi: Math.max(1, Math.min(1200, Number.parseInt(params.get('dpi') || '72', 10))),
    webpQuality: Math.min(100, Math.max(0, Number.parseInt(params.get('webpQ') || '90', 10))),
    gifColors: Math.min(
      256,
      Math.max(2, Number.parseInt(params.get('gifColors') || gifPaletteSize || '256', 10))
    ),
    maxOverlayIntensityL: Number.parseInt(
      params.get('maxIntL') || params.get('maxOverlayIntensityL') || '100',
      10
    ),
    maxOverlayIntensityM: Number.parseInt(
      params.get('maxIntM') || params.get('maxOverlayIntensityM') || '100',
      10
    ),
    maxOverlayIntensityQ: Number.parseInt(
      params.get('maxIntQ') || params.get('maxOverlayIntensityQ') || '100',
      10
    ),
    maxOverlayIntensityH: Number.parseInt(
      params.get('maxIntH') || params.get('maxOverlayIntensityH') || '100',
      10
    ),
    watermarkEnabled: params.get('wmEn') === '1',
    watermarkKind: (params.get('wmKind') || 'text') as WatermarkKind,
    watermarkText: params.get('wmText') || '',
    watermarkImageUrl: params.get('wmImg') || undefined,
    watermarkPosition: (params.get('wmPos') || 'center') as WatermarkPosition,
    watermarkOpacity: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get('wmOpacity') || '50', 10))
    ),
    watermarkBlend: (params.get('wmBlend') || 'normal') as WatermarkBlend,
    metaTitle: params.get('metaTitle') || undefined,
    metaAuthor: params.get('metaAuthor') || undefined,
    metaCopyright: params.get('metaCopy') || undefined,
    metaDescription: params.get('metaDesc') || undefined,
    metaLicense: params.get('metaLic') || undefined,
    metaCreationTime: params.get('metaTime') === '1',
    metaCustomKv: params.get('metaKv') || undefined,
    bgOverride: params.get('bgOver') ? `#${params.get('bgOver')}` : undefined,
    formatExtra: params.get('fmtExtra') || 'none',
    filename: params.get('fname') || 'anqr-qrcode',
    includeQuietZone: params.get('inclQz') !== '0',
    gifDisposalCode: parseGifDisposalCode(params.get('gifDisp') || 'restore_bg'),
    svgShapePrecision: params.get('svgPrec') || 'pixel',
    svgEmbedRasterOverlay: params.get('svgEmbed') !== '0',
  };
}

function parseAnimationParams(
  params: URLSearchParams
): Pick<
  ParsedHandlerParams,
  | 'animationPattern'
  | 'animationPattern2'
  | 'animationLoop'
  | 'animationBounce'
  | 'animationReverse'
  | 'animationColorCycle'
  | 'animationTarget'
  | 'animationWaveAxis'
  | 'animationBounce2'
  | 'animationReverse2'
  | 'animationColorCycle2'
  | 'animationTarget2'
  | 'animationWaveAxis2'
  | 'animationInterpolate'
  | 'animationTemporalDither'
  | 'animationModuleJitter'
  | 'animationFrames'
  | 'animationSpeed'
  | 'animationSeed'
  | 'animationSeed2'
  | 'animationEasing'
  | 'animationEasing2'
> {
  const validAnimationPatterns: AnimationPattern[] = [
    'none',
    'pulse',
    'wave',
    'scanline',
    'shimmer',
    'drift',
    'color_cycle',
  ];
  const validAnimationEasings: AnimationEasing[] = [
    'linear',
    'ease_in',
    'ease_out',
    'ease_in_out',
    'bounce',
  ];
  const parsedP1 = (params.get('animPattern') || 'none') as AnimationPattern;
  const animationPattern = validAnimationPatterns.includes(parsedP1) ? parsedP1 : 'none';
  const parsedP2 = (params.get('animPattern2') || 'none') as AnimationPattern;
  const animationPattern2 = validAnimationPatterns.includes(parsedP2) ? parsedP2 : 'none';
  const animationBounce = params.get('bounce') === '1';
  const animationReverse = params.get('reverse') === '1';
  const animationTarget = parseAnimationTarget(params.get('animTarget'));
  const animationWaveAxis = parseAnimationWaveAxis(params.get('animWaveAxis'));
  const animationFramesRaw = Number.parseInt(params.get('animFrames') || '24', 10);
  const animationSpeedRaw = Number.parseInt(
    params.get('animSpeed') || params.get('speed') || '100',
    10
  );
  const animationSeed = Number.parseInt(params.get('animSeed') || params.get('seed') || '0', 10);
  const parsedEasing = (params.get('easing') || 'linear') as AnimationEasing;
  const animationEasing = validAnimationEasings.includes(parsedEasing) ? parsedEasing : 'linear';
  const parsedEasing2 = (params.get('easing2') || animationEasing) as AnimationEasing;
  return {
    animationPattern,
    animationPattern2,
    animationLoop: params.get('loop') !== '0',
    animationBounce,
    animationReverse,
    animationColorCycle: params.get('colorCycle') === '1',
    animationTarget,
    animationWaveAxis,
    animationBounce2: params.has('bounce2') ? params.get('bounce2') === '1' : animationBounce,
    animationReverse2: params.has('reverse2') ? params.get('reverse2') === '1' : animationReverse,
    animationColorCycle2: params.has('colorCycle2') ? params.get('colorCycle2') === '1' : false,
    animationTarget2: parseAnimationTarget(params.get('animTarget2'), animationTarget),
    animationWaveAxis2: parseAnimationWaveAxis(
      params.get('animWaveAxis2'),
      animationWaveAxis === 'y' ? 'x' : animationWaveAxis
    ),
    animationInterpolate: (params.get('interp') || 'none') as AnimationInterpolation,
    animationTemporalDither: (['off', 'blue_noise', 'flicker_safe'].includes(
      params.get('tempDither') || ''
    )
      ? params.get('tempDither')
      : 'off') as AnimationTemporalDitherMode,
    animationModuleJitter: Number.parseFloat(params.get('jitter') || '0'),
    animationFrames: Math.min(
      60,
      Math.max(1, Number.isNaN(animationFramesRaw) ? 24 : animationFramesRaw)
    ),
    animationSpeed: Math.min(
      1000,
      Math.max(10, Number.isNaN(animationSpeedRaw) ? 100 : animationSpeedRaw)
    ),
    animationSeed,
    animationSeed2: Number.parseInt(params.get('animSeed2') || String(animationSeed + 911), 10),
    animationEasing,
    animationEasing2: validAnimationEasings.includes(parsedEasing2)
      ? parsedEasing2
      : animationEasing,
    animationStartFrame: Number.parseInt(params.get('startF') || '0', 10),
    animationMaxFrames: Number.parseInt(params.get('maxF') || '0', 10),
    animationFrameStep: Number.parseInt(params.get('stepF') || '1', 10),
  };
}

function parseHandlerParams(params: URLSearchParams, request: Request): ParsedHandlerParams {
  return {
    ...parseCoreQRParams(params),
    ...parseStylingParams(params),
    ...parseProtectionParams(params),
    ...parseOverlayParams(params),
    ...parseDitherParams(params),
    ...parseOutputParams(params),
    ...parseAnimationParams(params),
    skipCache: request.headers.get('X-ANQR-Skip-Cache') === '1',
  };
}

function validateParsedParams(p: ParsedHandlerParams): Response | null {
  if (!p.data) {
    return new Response('Missing required "data" parameter', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  if (p.data.length > MAX_DATA_LENGTH) {
    return new Response(`Data too long: ${p.data.length} characters (max: ${MAX_DATA_LENGTH})`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  if (!['L', 'M', 'Q', 'H'].includes(p.ec)) {
    return new Response('Invalid "ec" parameter. Use L, M, Q, or H', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  const validModuleStyles = ['square', 'rounded', 'dots', 'diamond', 'connected'];
  if (!validModuleStyles.includes(p.moduleStyle)) {
    return new Response(`Invalid "style" parameter. Use one of: ${validModuleStyles.join(', ')}`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

function buildQRGeneratorConfig(
  p: ParsedHandlerParams,
  moduleSize: number
): Record<string, unknown> {
  return {
    content: p.data,
    typeNumber: p.version,
    errorCorrection: p.ec,
    encodingMode: p.encodingMode,
    maskPattern: p.maskPattern,
    characterEncoding: p.characterEncoding,
    seed: p.renderSeed,
    moduleSize,
    margin: p.margin + p.borderModulesExtra,
    quietZoneMinEnforce: p.quietZoneMinEnforce,
    crispEdges: p.crispEdges,
    pixelSnap: p.pixelSnap,
    fgColor: `#${p.fg}`,
    bgColor: `#${p.bg}`,
    transparentBg: p.transparent,
    moduleStyle: p.moduleStyle,
    finderStyle: p.finderStyle,
    alignmentStyle: p.alignmentStyle,
    timingStyle: p.timingStyle,
    eyeOuterStyle: p.eyeOuterStyle,
    eyeInnerStyle: p.eyeInnerStyle,
    eyeScale: p.eyeScale,
    cornerRadius: p.cornerRadius,
    moduleGap: p.moduleGap,
    gapMode: p.gapMode,
    dotRotationDeg: p.dotRotationDeg,
    frameStyle: p.frameStyle,
    frameText: p.frameText,
    perModuleColorMode: p.perModuleColorMode,
    contrastGuard: p.contrastGuard,
    minContrastRatio: p.minContrastRatio,
    overlayMode: p.overlayMode,
    overlayIntensity: p.overlayIntensity,
    colorMode: p.colorMode,
    logoSize: p.logoSize,
    preserveFinders: p.preserveFinders,
    preserveTiming: p.preserveTiming,
    preserveAlignment: p.preserveAlignment,
    protectFormatInfo: p.protectFormatInfo,
    protectVersionInfo: p.protectVersionInfo,
    eccAwareEnabled: p.eccAwareEnabled,
    eccAwareRiskBudget: p.eccAwareRiskBudget,
    eccAwareWeightMap: p.eccAwareWeightMap,
    overlayBrightness: p.overlayBrightness,
    overlayContrast: p.overlayContrast,
    overlayGamma: p.overlayGamma,
    overlaySaturation: p.overlaySaturation,
    overlayHueRotate: p.overlayHueRotate,
    invertImage: p.overlayInvert,
    overlayBlur: p.overlayBlur,
    overlaySharpen: p.overlaySharpen,
    overlayPosterize: p.overlayPosterize,
    overlayThreshold: p.overlayThreshold,
    overlayEdgeDetect: p.overlayEdgeDetect,
    overlayFit: p.overlayFit,
    overlayRotate: p.overlayRotate,
    overlayFlipX: p.overlayFlipX,
    overlayFlipY: p.overlayFlipY,
    ditherKind: p.ditherKind,
    diffusionKernel: p.diffusionKernel,
    ditherStrength: p.ditherStrength,
    finderDitherStrength: p.finderDitherStrength,
    blendPreservations: p.blendPreservations,
    blendPreservationMode: p.blendPreservationMode,
    ditherSerpentine: p.ditherSerpentine,
    orderedMatrix: p.orderedMatrix,
    blueNoiseTileSize: p.blueNoiseTileSize,
    blueNoiseSeed: p.blueNoiseSeed,
    colorDither: p.colorDither,
    subpixelGridSize: p.subpixelGridSize,
    subpixelGrid: p.subpixelGridNum,
    subpixelCenterRule: p.subpixelCenterRule,
    subpixelNeutralColor: p.subpixelNeutralColor,
    subpixelFinderOverride: p.subpixelFinderOverride,
    halftoneCell: p.halftoneCell,
    halftoneDotShape: p.halftoneDotShape,
    brightnessCurve: p.brightnessCurve,
    duotoneColors: [p.duotoneColor1, p.duotoneColor2],
    palette: p.palette,
    gradient:
      p.gradientType === 'none'
        ? undefined
        : { type: p.gradientType, angle: p.gradientAngle, stops: p.gradientStops },
    maxOverlayIntensityByEcc: {
      L: p.maxOverlayIntensityL,
      M: p.maxOverlayIntensityM,
      Q: p.maxOverlayIntensityQ,
      H: p.maxOverlayIntensityH,
    },
    animationPattern: p.animationPattern,
    animationPattern2: p.animationPattern2,
    animationFrames: p.animationFrames,
    animationSpeed: p.animationSpeed,
    animationSeed: p.animationSeed,
    animationSeed2: p.animationSeed2,
    animationLoop: p.animationLoop,
    animationBounce: p.animationBounce,
    animationBounce2: p.animationBounce2,
    animationReverse: p.animationReverse,
    animationReverse2: p.animationReverse2,
    animationInterpolate: p.animationInterpolate,
    animationTemporalDither: p.animationTemporalDither,
    animationTarget: p.animationTarget,
    animationTarget2: p.animationTarget2,
    animationWaveAxis: p.animationWaveAxis,
    animationWaveAxis2: p.animationWaveAxis2,
    animationStartFrame: p.animationStartFrame,
    animationMaxFrames: p.animationMaxFrames,
    animationFrameStep: p.animationFrameStep,
    moduleJitterPx: p.animationModuleJitter,
    colorCycle: p.animationColorCycle,
    colorCycle2: p.animationColorCycle2,
    cropEnabled: p.cropEnabled,
    cropX: p.cropX,
    cropY: p.cropY,
    cropSize: p.cropSize,
    overlayType: p.overlayType,
    overlayFramePick: p.overlayFramePick,
    gifUseFrameDelays: p.gifUseFrameDelays,
    gifDisposalHandling: p.gifDisposalHandling,
    lockFinders: p.lockFinders,
    lockTiming: p.lockTiming,
    lockAlign: p.lockAlign,
    lockFormat: p.lockFormat,
    lockVersion: p.lockVersion,
    safetyMode: p.safetyMode,
    safetyMinModulePx: p.safetyMinModulePx,
    safetyMinQuietZone: p.safetyMinQuietZone,
    autoPickVersion: p.autoPickVersion,
    autoPickEcc: p.autoPickEcc,
    autoReduceIntensity: p.autoReduceIntensity,
    scanGateProfile: 'full' as const,
    bgOverride: p.bgOverride,
    formatExtra: p.formatExtra,
    filename: p.filename,
    includeQuietZone: p.includeQuietZone,
    svgShapePrecision: p.svgShapePrecision,
    svgEmbedRasterOverlay: p.svgEmbedRasterOverlay,
    paletteMode: p.paletteMode,
  };
}

function buildFilterOptionsFromParams(p: ParsedHandlerParams): OverlayFilterOptions {
  return {
    brightness: p.overlayBrightness,
    contrast: p.overlayContrast,
    gamma: p.overlayGamma,
    saturation: p.overlaySaturation,
    hue: p.overlayHueRotate,
    invert: p.overlayInvert,
    blur: p.overlayBlur,
    sharpen: p.overlaySharpen,
    posterize: p.overlayPosterize,
    threshold: p.overlayThreshold,
    edge: p.overlayEdgeDetect as 'off' | 'sobel' | 'canny',
  };
}

function buildWatermarkOpts(
  p: ParsedHandlerParams,
  watermarkImageCanvas: Canvas | null
): WatermarkOptions | null {
  if (!p.watermarkEnabled) return null;
  return {
    enabled: p.watermarkEnabled,
    kind: p.watermarkKind,
    text: p.watermarkText,
    imageCanvas: watermarkImageCanvas,
    position: p.watermarkPosition,
    opacity: p.watermarkOpacity,
    blend: p.watermarkBlend,
  };
}

async function renderInitialQRCode(
  p: ParsedHandlerParams,
  config: Record<string, unknown>,
  overlayCanvas: Canvas | null,
  hasAnimatedOverlay: boolean,
  artworkState: ArtworkState,
  qrGenerator: QRGenerator
): Promise<Canvas> {
  const isArtworkMode = p.overlayMode === 'artwork';
  const useArtworkOverlayCompositing =
    isArtworkMode &&
    p.outputFormat === 'gif' &&
    (hasAnimatedOverlay || p.animationPattern !== 'none');
  if (isArtworkMode && overlayCanvas) {
    try {
      return await generateArtworkFrame(
        overlayCanvas,
        0,
        useArtworkOverlayCompositing,
        artworkState,
        p.data,
        p.ec,
        p.version,
        p.maskPattern,
        config,
        qrGenerator
      );
    } catch (error_) {
      console.warn('[ARTWORK] full QR-Art failed, falling back to standard render', {
        error: error_ instanceof Error ? error_.message : String(error_),
      });
      return await qrGenerator.generate(config, overlayCanvas);
    }
  }
  return await qrGenerator.generate(config, overlayCanvas);
}

async function generateGifAnimationFrames(
  p: ParsedHandlerParams,
  config: Record<string, unknown>,
  outputCanvas: Canvas,
  overlayCanvas: Canvas | null,
  overlayFrames: ServerAnimationFrame[],
  hasAnimatedOverlay: boolean,
  artworkState: ArtworkState,
  totalMargin: number,
  estimatedModuleCount: number,
  qrGenerator: QRGenerator,
  watermarkOpts: WatermarkOptions | null
): Promise<{ animationFrameCanvases: Canvas[]; animatedOverlayFrames: ServerAnimationFrame[] }> {
  const isArtworkMode = p.overlayMode === 'artwork';
  const primaryAnimationEffect: AnimationEffectConfig = {
    pattern: p.animationPattern,
    seed: p.animationSeed,
    easing: p.animationEasing as AnimationEasing,
    colorCycle: p.animationColorCycle,
    reverse: p.animationReverse,
    bounce: p.animationBounce,
    target: p.animationTarget,
    waveAxis: p.animationWaveAxis,
  };
  const secondaryAnimationEffect: AnimationEffectConfig = {
    pattern: p.animationPattern2,
    seed: p.animationSeed2,
    easing: p.animationEasing2 as AnimationEasing,
    colorCycle: p.animationColorCycle2,
    reverse: p.animationReverse2,
    bounce: p.animationBounce2,
    target: p.animationTarget2,
    waveAxis: p.animationWaveAxis2,
  };
  const { moduleAnimationEffects, resultAnimationEffects, hasAnyAnimationEffects } =
    buildAnimationEffectArrays(
      primaryAnimationEffect,
      secondaryAnimationEffect,
      p.animationTemporalDither
    );

  let animationFrameCanvases: Canvas[] = [];
  let animatedOverlayFrames: ServerAnimationFrame[] = [];

  if (hasAnimatedOverlay && overlayFrames.length > 1) {
    animatedOverlayFrames = await renderAnimatedOverlayLoop(
      overlayFrames,
      isArtworkMode,
      moduleAnimationEffects,
      resultAnimationEffects,
      p.animationInterpolate,
      p.animationTemporalDither,
      p.animationSeed,
      p.animationModuleJitter,
      config,
      totalMargin,
      estimatedModuleCount,
      artworkState,
      p.data,
      p.ec,
      p.version,
      p.maskPattern,
      qrGenerator,
      p.outputWidth,
      p.outputHeight,
      watermarkOpts,
      p.gifDisposalCode
    );
  } else if (hasAnyAnimationEffects) {
    const totalAnimFrames = Math.max(1, p.animationFrames);
    const canUseFastPatternPath =
      moduleAnimationEffects.length === 0 &&
      resultAnimationEffects.length === 1 &&
      p.animationInterpolate === 'none' &&
      p.animationTemporalDither === 'off';

    if (canUseFastPatternPath) {
      const effect = resultAnimationEffects[0];
      animationFrameCanvases = generatePatternFramesServer(
        outputCanvas,
        effect.pattern,
        totalAnimFrames,
        effect.seed,
        effect.easing,
        effect.waveAxis,
        effect.colorCycle,
        effect.reverse,
        effect.bounce
      );
    } else {
      animationFrameCanvases = await renderPatternAnimationLoop(
        overlayCanvas,
        isArtworkMode,
        moduleAnimationEffects,
        resultAnimationEffects,
        p.animationInterpolate,
        p.animationTemporalDither,
        p.animationSeed,
        p.animationModuleJitter,
        totalAnimFrames,
        config,
        artworkState,
        p.data,
        p.ec,
        p.version,
        p.maskPattern,
        qrGenerator,
        p.outputWidth,
        p.outputHeight,
        watermarkOpts
      );
    }
  }
  return { animationFrameCanvases, animatedOverlayFrames };
}

function buildFinalResponse(
  outputBuffer: Buffer,
  contentType: string,
  cacheKey: string,
  isDegraded: boolean
): Response {
  const etagSource = `${cacheKey}:${contentType}:${isDegraded ? 'degraded' : 'full'}:${outputBuffer.byteLength}`;
  const etag = `"${createHash('sha256').update(etagSource).digest('hex')}"`;
  return new Response(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isDegraded
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=31536000, immutable',
      ...(isDegraded ? { 'X-ANQR-Status': 'generating' } : {}),
      ETag: etag,
      Vary: 'Accept-Encoding',
      ...CORS_HEADERS,
    },
  });
}

async function handleCacheAndResponse(
  p: ParsedHandlerParams,
  outputBuffer: Buffer,
  contentType: string,
  cacheKey: string,
  requestUrl: string
): Promise<Response> {
  const isDegraded = !!(p.overlayUrl && p.overlayMode) && !p.isFullRender;
  qrFnLog('[BLOB] render result', {
    isDegraded,
    isFullRender: p.isFullRender,
    hasOverlay: !!(p.overlayUrl && p.overlayMode),
    bufferSize: outputBuffer.byteLength,
    cacheKey: cacheKey.slice(0, 80),
  });

  if (!(isDegraded || p.skipCache)) {
    await writeBlobCache(cacheKey, outputBuffer, contentType);
  }
  if (isDegraded && !p.skipCache) {
    await triggerBackgroundRender(cacheKey, requestUrl);
  }

  return buildFinalResponse(outputBuffer, contentType, cacheKey, isDegraded);
}

function computeModuleSize(
  modulePxParam: number | undefined,
  size: number,
  totalMargin: number,
  estimatedModuleCount: number
): number {
  if (modulePxParam) {
    return Math.max(1, Math.min(50, modulePxParam));
  }
  return Math.max(
    1,
    Math.floor((size - totalMargin * 2) / (estimatedModuleCount + totalMargin * 2))
  );
}

async function processQRRequest(
  p: ParsedHandlerParams,
  params: URLSearchParams,
  requestUrl: string
): Promise<Response> {
  const cacheKey = computeCacheKey(params);
  qrFnLog('[BLOB] cache lookup', { cacheKey: cacheKey.slice(0, 80), skipCache: p.skipCache });
  const cachedResponse = await lookupBlobCache(cacheKey, p.skipCache);
  if (cachedResponse) return cachedResponse;

  const qrGenerator = new QRGenerator(nodeCanvasFactory);
  const estimatedVersion = calculateOptimalVersion(p.data, p.ec);
  const estimatedModuleCount = estimatedVersion * 4 + 17;
  const totalMargin = p.margin + p.borderModulesExtra;
  const moduleSize = computeModuleSize(p.modulePxParam, p.size, totalMargin, estimatedModuleCount);

  const config = buildQRGeneratorConfig(p, moduleSize);
  const filterOptions = buildFilterOptionsFromParams(p);

  const overlayResult = await loadAndPreprocessOverlay(
    p.overlayUrl,
    p.overlayMode,
    p.isFullRender,
    p.strictOverlay,
    p.explicitFormat,
    p.outputFormat,
    p.cropEnabled,
    p.cropX,
    p.cropY,
    p.cropSize,
    p.overlayRotate,
    p.overlayFlipX,
    p.overlayFlipY,
    filterOptions,
    p.gifDisposalHandling,
    p.gifMaxFps
  );
  if (overlayResult instanceof Response) return overlayResult;
  const { overlayCanvas, overlayFrames, hasAnimatedOverlay } = overlayResult;
  p.outputFormat = overlayResult.outputFormat;

  const artworkState: ArtworkState = { lockedMask: -1, lockedVersion: p.version };
  let canvas = await renderInitialQRCode(
    p,
    config,
    overlayCanvas,
    hasAnimatedOverlay,
    artworkState,
    qrGenerator
  );

  const watermarkImageCanvas = await loadWatermarkImage(
    p.watermarkEnabled,
    p.watermarkKind,
    p.watermarkImageUrl
  );
  const watermarkOpts = buildWatermarkOpts(p, watermarkImageCanvas);

  if (watermarkOpts) {
    canvas = applyWatermarkServer(canvas, watermarkOpts);
  }

  const outputCanvas = scaleToOutputDimensions(canvas, p.outputWidth, p.outputHeight);

  const metadata = buildPngMetadata(
    p.metaTitle,
    p.metaAuthor,
    p.metaCopyright,
    p.metaDescription,
    p.metaLicense,
    p.metaCreationTime,
    p.metaCustomKv
  );

  let animationFrameCanvases: Canvas[] = [];
  let animatedOverlayFrames: ServerAnimationFrame[] = [];

  if (p.outputFormat === 'gif') {
    const animResult = await generateGifAnimationFrames(
      p,
      config,
      outputCanvas,
      overlayCanvas,
      overlayFrames,
      hasAnimatedOverlay,
      artworkState,
      totalMargin,
      estimatedModuleCount,
      qrGenerator,
      watermarkOpts
    );
    animationFrameCanvases = animResult.animationFrameCanvases;
    animatedOverlayFrames = animResult.animatedOverlayFrames;
  }

  const gifBackgroundColor = p.bgOverride || `#${p.bg}`;
  const { buffer: outputBuffer, contentType } = await encodeOutputImage(
    p.outputFormat,
    animatedOverlayFrames,
    animationFrameCanvases,
    outputCanvas,
    p.gifColors,
    p.gifDisposalCode,
    gifBackgroundColor,
    p.transparent,
    p.animationSpeed,
    p.webpQuality,
    p.outputQuality,
    metadata,
    p.outputDpi
  );

  return handleCacheAndResponse(p, outputBuffer, contentType, cacheKey, requestUrl);
}

async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const params = url.searchParams;
  const p = parseHandlerParams(params, request);

  const validationError = validateParsedParams(p);
  if (validationError) return validationError;

  const serializeAnimatedRender = shouldSerializeAnimatedRender(params);
  let releaseAnimatedRenderLock: (() => void) | null = null;

  try {
    if (serializeAnimatedRender) {
      releaseAnimatedRenderLock = await acquireAnimatedRenderLock();
    }

    return await processQRRequest(p, params, request.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Sentry.captureException(error);
    return new Response(`Error generating QR code: ${message}`, {
      status: 500,
      headers: CORS_HEADERS,
    });
  } finally {
    if (releaseAnimatedRenderLock) {
      releaseAnimatedRenderLock();
    }
  }
}
export default handler;

export const __test = {
  nodeCanvasFactory,
  isPrivateOrReservedIP,
  _isPrivateHostname,
  _clearOverlayHostnameSafetyCache,
  createTextWatermark,
  getWatermarkPositions,
  applyBlendMode,
  applyWatermarkServer,
  calculateCrc32,
  createPngTextChunk,
  createPngPhysChunk,
  embedPngMetadataAndDpi,
  prepareGifFramePixels,
  encodeGif,
  encodeAnimatedGif,
  generatePatternFramesServer,
  cropOverlayServer,
  rgbToGrayServer,
  convolveServer,
  blurServer,
  sharpenServer,
  posterizeServer,
  thresholdServer,
  sobelEdgeServer,
  cannyEdgeServer,
  applyOverlayFiltersServer,
  flipOverlayServer,
  rotateOverlayServer,
  isGifBuffer,
  parseGifFramesServer,
  decimateFramesToMaxFps,
  decimateFramesToMaxCount,
  encodeAnimatedGifWithDelays,
  parseGradientStops,
  fetchImageWithBuffer,
  fetchImageAsCanvas,
};
