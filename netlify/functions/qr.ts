// Initialize Sentry for error tracking (must be first import)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824',
  sendDefaultPii: true,
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
import { type Canvas, createCanvas, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
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
type WatermarkBlend = 'normal' | 'multiply' | 'screen' | 'overlay';
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
const MAX_GIF_FRAMES = 60;
const MAX_GIF_DURATION_MS = 10000;

// Fetch timeout in milliseconds
const FETCH_TIMEOUT_MS = 10000;

// Default dither algorithm for server-side when none specified (fast)
const DEFAULT_SERVER_DITHER: DitherKind = 'ordered_bayer';

// Default output format - align with client default (GIF) for consistency
const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'gif';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Check if an IP address is private/internal (SSRF protection)
 * Works with both literal IP strings and resolved addresses
 */
function isPrivateOrReservedIP(ip: string): boolean {
  // Check for localhost variants
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
    return true;
  }

  // IPv4 private ranges
  const ipv4Match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b, c, _d] = ipv4Match.map(Number);
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (a === 192 && b === 0 && c === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (a === 192 && b === 0 && c === 2) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (a === 198 && b === 51 && c === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (a === 203 && b === 0 && c === 113) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (Reserved)
    if (a >= 240) return true;
  }

  // IPv6 private/reserved (simplified check)
  if (
    ip.startsWith('fe80:') || // link-local
    ip.startsWith('fc') ||
    ip.startsWith('fd') || // unique local
    ip === '::1' ||
    ip.startsWith('::ffff:') // IPv4-mapped IPv6
  ) {
    return true;
  }

  return false;
}

/**
 * Resolve hostname and check if it points to a private IP (DNS rebinding protection)
 * This prevents SSRF via DNS resolution to internal IPs
 */
async function _isPrivateHostname(hostname: string): Promise<boolean> {
  // First check if it's already a literal IP
  if (isPrivateOrReservedIP(hostname)) {
    return true;
  }

  // Check for common bypass patterns
  const lowerHost = hostname.toLowerCase();
  if (
    lowerHost.endsWith('.local') ||
    lowerHost.endsWith('.localhost') ||
    lowerHost.endsWith('.internal') ||
    lowerHost.includes('127.0.0.1') ||
    lowerHost.includes('0.0.0.0')
  ) {
    return true;
  }

  // NOTE: DNS resolution IS technically possible in Node.js via the 'dns' module,
  // but we intentionally use heuristic checks here for several reasons:
  // 1. DNS resolution adds latency to every overlay fetch
  // 2. Netlify's network layer provides additional SSRF protection
  // 3. DNS rebinding attacks require attacker-controlled DNS which is rare
  // The heuristic checks above catch the most common SSRF patterns.
  // For higher-security deployments, consider adding actual DNS resolution checks.
  return false;
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

/**
 * Encode canvas as GIF (single frame)
 */
function encodeGif(canvas: Canvas, colors: number = 256, disposal: number = 2): Buffer {
  if (!isGifEncodingAvailable()) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const gif = createGifEncoder();
  const palette = quantizeGifPalette(data, Math.min(256, Math.max(2, colors)));
  const index = indexGifPixels(data, palette);

  gif.writeFrame(index, width, height, {
    palette,
    delay: 100,
    repeat: 0,
    disposal,
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
  disposal: number = 1
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

  // gifenc expects delay in milliseconds (it converts to centiseconds internally)
  // Minimum 20ms — gifenc rounds <20ms to 0-1 centiseconds which browsers treat as 100ms
  const delayMs = Math.max(20, frameDelayMs);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const ctx = frame.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    const palette = quantizeGifPalette(data, paletteSize);
    const index = indexGifPixels(data, palette);

    // Only set repeat on first frame
    const frameOptions: Record<string, unknown> = {
      palette,
      delay: delayMs,
      disposal,
    };
    if (i === 0) {
      frameOptions.repeat = 0; // 0 = loop forever
    }

    gif.writeFrame(index, width, height, frameOptions);
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

// ============================================
// ANIMATION PATTERNS (server-side)
// ============================================

// AnimationPattern and AnimationEasing types imported from shared module as SharedAnimationPattern and AnimationEasing

/**
 * Generate animation frames using a pattern effect
 */
function generatePatternFramesServer(
  sourceCanvas: Canvas,
  pattern: AnimationPattern,
  frameCount: number = 24,
  seed: number = 0,
  easing: AnimationEasing = 'linear'
): Canvas[] {
  if (pattern === 'none') {
    return [sourceCanvas];
  }

  const frames: Canvas[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const sourceCtx = sourceCanvas.getContext('2d');
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  for (let i = 0; i < frameCount; i++) {
    const linearProgress = i / frameCount;
    const progress = applyAnimationEasing(linearProgress, easing);
    const frame = createCanvas(width, height);
    const ctx = frame.getContext('2d');

    const frameData = ctx.createImageData(width, height);
    frameData.data.set(sourceData.data);

    switch (pattern) {
      case 'pulse':
        applyAnimationPulse(frameData.data, progress, seed);
        break;
      case 'wave':
        applyAnimationWave(frameData.data, progress, width, height, seed);
        break;
      case 'scanline':
        applyAnimationScanline(frameData.data, progress, width, height, seed);
        break;
      case 'shimmer':
        applyAnimationShimmer(frameData.data, progress, width, height, seed);
        break;
      case 'drift':
        applyAnimationDrift(frameData.data, progress, width, height, seed);
        break;
      case 'color_cycle':
        applyAnimationColorCycle(frameData.data, progress, seed);
        break;
    }

    ctx.putImageData(frameData, 0, 0);
    frames.push(frame);
  }

  return frames;
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
  const kernel = Array(size)
    .fill(null)
    .map(() => Array(size).fill(1));
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

      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
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
function applyOverlayFiltersServer(
  source: Canvas,
  options: {
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    gamma?: number; // 0.1 to 3
    saturation?: number; // -100 to 100
    hue?: number; // degrees
    invert?: boolean;
    blur?: number; // pixels
    sharpen?: number; // 0-100
    posterize?: number; // levels 2-256
    threshold?: number; // 0-255
    edge?: 'off' | 'sobel' | 'canny'; // edge detection mode
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
  const blurRadius = options.blur ?? 0;
  const sharpenAmount = options.sharpen ?? 0;
  const posterizeLevels = options.posterize ?? 0;
  const thresholdLevel = options.threshold;
  const edgeMode = options.edge ?? 'off';

  // Pre-calculate contrast factor
  const contrastFactor = (1 + contrast) / (1 - contrast * 0.5);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    // Invert
    if (invert) {
      r = 1 - r;
      g = 1 - g;
      b = 1 - b;
    }

    // Brightness
    r += brightness;
    g += brightness;
    b += brightness;

    // Contrast
    r = (r - 0.5) * contrastFactor + 0.5;
    g = (g - 0.5) * contrastFactor + 0.5;
    b = (b - 0.5) * contrastFactor + 0.5;

    // Gamma
    if (gamma !== 1) {
      r = Math.max(0, r) ** (1 / gamma);
      g = Math.max(0, g) ** (1 / gamma);
      b = Math.max(0, b) ** (1 / gamma);
    }

    // Saturation and hue (convert to HSL, adjust, convert back)
    if (saturation !== 0 || hue !== 0) {
      // RGB to HSL
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

      // Apply hue rotation
      h += hue / (2 * Math.PI);
      if (h > 1) h -= 1;
      if (h < 0) h += 1;

      // Apply saturation
      s = Math.max(0, Math.min(1, s * (1 + saturation)));

      // HSL to RGB
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
    }

    // Clamp and write back
    data[i] = Math.round(Math.max(0, Math.min(1, r)) * 255);
    data[i + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
    data[i + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
  }

  // Apply convolution-based filters (blur, sharpen, edge detection)
  if (blurRadius > 0) {
    const blurred = blurServer(data, result.width, result.height, blurRadius);
    data.set(blurred);
  }

  if (sharpenAmount > 0) {
    const sharpened = sharpenServer(data, result.width, result.height, sharpenAmount);
    data.set(sharpened);
  }

  // Apply posterize
  if (posterizeLevels > 1) {
    const posterized = posterizeServer(data, posterizeLevels);
    data.set(posterized);
  }

  // Apply threshold (binary) - only if explicitly specified
  if (thresholdLevel !== undefined) {
    const thresholded = thresholdServer(data, thresholdLevel);
    data.set(thresholded);
  }

  // Apply edge detection
  if (edgeMode === 'sobel') {
    const edges = sobelEdgeServer(data, result.width, result.height);
    data.set(edges);
  } else if (edgeMode === 'canny') {
    const edges = cannyEdgeServer(data, result.width, result.height);
    data.set(edges);
  }

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
  }

  // Calculate total duration and warn if excessive
  const totalDuration = framesToProcess.reduce((sum, f) => sum + f.delay, 0);
  if (totalDuration > MAX_GIF_DURATION_MS) {
  }

  const { width, height } = decoded;

  // Create a persistent canvas for compositing frames
  const compositeCanvas = createCanvas(width, height);
  const compositeCtx = compositeCanvas.getContext('2d');

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

    // Create temporary canvas for this frame's patch
    const patchCanvas = createCanvas(dims.width, dims.height);
    const patchCtx = patchCanvas.getContext('2d');
    patchCtx.putImageData(imageData, 0, 0);

    // Draw patch onto composite canvas
    compositeCtx.drawImage(patchCanvas, dims.left, dims.top);

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

  const totalDelay = frames.reduce((sum, f) => sum + (f.delay || 100), 0);
  const avgDelay = totalDelay / frames.length;
  const sourceFps = avgDelay > 0 ? 1000 / avgDelay : 0;

  if (!sourceFps || sourceFps <= targetFps) {
    return frames;
  }

  const ratio = sourceFps / targetFps;
  const keepIndices: number[] = [];

  let accumulator = 0;
  for (let i = 0; i < frames.length; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      keepIndices.push(i);
      accumulator -= ratio;
    }
  }

  if (keepIndices.length === 0) {
    keepIndices.push(0);
  }
  if (keepIndices[0] !== 0) {
    keepIndices.unshift(0);
  }
  if (keepIndices[keepIndices.length - 1] !== frames.length - 1) {
    keepIndices.push(frames.length - 1);
  }

  return keepIndices.map((idx) => frames[idx]).filter(Boolean);
}

/**
 * Encode multiple canvases as animated GIF with per-frame delays
 */
function encodeAnimatedGifWithDelays(
  frames: ServerAnimationFrame[],
  colors: number = 256,
  disposal: number = 1
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

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const ctx = frame.canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    const palette = quantizeGifPalette(data, paletteSize);
    const index = indexGifPixels(data, palette);

    // gifenc expects delay in milliseconds (it converts to centiseconds internally)
    // Minimum 20ms — gifenc rounds <20ms to 0-1 centiseconds which browsers treat as 100ms
    const delayMs = Math.max(20, frame.delay);

    const frameOptions: Record<string, unknown> = {
      palette,
      delay: delayMs,
      disposal,
    };
    if (i === 0) {
      frameOptions.repeat = 0; // 0 = loop forever
    }

    gif.writeFrame(index, width, height, frameOptions);
  }

  gif.finish();
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

/**
 * Fetch an image from URL and load it into a canvas
 * Also returns the raw array buffer to detect animated GIFs
 */
async function fetchImageWithBuffer(url: string): Promise<FetchedImage | null> {
  try {
    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }

      // SSRF protection: block private/internal IP addresses
      if (isPrivateOrReservedIP(parsedUrl.hostname)) {
        return null;
      }
    } catch {
      return null;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ANQR-QR-Generator/1.0',
      },
      signal: controller.signal,
      redirect: 'follow', // Follows up to 20 redirects by default; MAX_REDIRECTS is for documentation
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    // Check Content-Type header for image types
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

    // STREAMING APPROACH: Read chunks and abort if size exceeds limit
    // This prevents memory spikes from malicious/buggy servers that lie about Content-Length
    const reader = response.body?.getReader();
    if (!reader) {
      return null;
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalBytes += value.byteLength;

        // Abort immediately if we exceed the size limit
        if (totalBytes > MAX_OVERLAY_BYTES) {
          reader.cancel();
          return null;
        }

        chunks.push(value);
      }
    } catch (_streamError) {
      return null;
    }

    // Combine chunks into a single buffer
    const arrayBuffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      arrayBuffer.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const buffer = Buffer.from(arrayBuffer);

    // Check if it's a GIF with multiple frames
    let isAnimatedGif = false;
    if (isGifBuffer(arrayBuffer)) {
      try {
        const decoded = decodeGif(arrayBuffer);
        isAnimatedGif = decoded.frames.length > 1;
      } catch (_e) {}
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
  } catch (_error) {
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

async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  // Get required parameter
  const data = params.get('data');
  if (!data) {
    return new Response('Missing required "data" parameter', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Validate data length (DoS protection)
  if (data.length > MAX_DATA_LENGTH) {
    return new Response(`Data too long: ${data.length} characters (max: ${MAX_DATA_LENGTH})`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Client-only hint (UI locale)
  const lang = params.get('lang') || undefined;
  void lang;

  // Parse all parameters with defaults
  const sizeParam = Number.parseInt(params.get('size') || '400', 10);
  const modulePxParam = params.get('modulePx')
    ? Number.parseInt(params.get('modulePx')!, 10)
    : null;
  const widthParam = params.get('w') ? Number.parseInt(params.get('w')!, 10) : null;
  const heightParam = params.get('h') ? Number.parseInt(params.get('h')!, 10) : null;

  // Use w/h if provided, otherwise fall back to size
  // Cap at MAX_SERVER_IMAGE_SIZE for server-side performance
  const outputWidth = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, widthParam ?? sizeParam));
  const outputHeight = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, heightParam ?? sizeParam));
  // For QR generation, use the larger dimension to ensure quality
  const size = Math.max(outputWidth, outputHeight);
  const fg = params.get('fg') || '000000';
  const bg = params.get('bg') || 'ffffff';
  const ec = (params.get('ec')?.toUpperCase() || 'H') as ECCLevel;
  const margin = Math.min(20, Math.max(0, Number.parseInt(params.get('margin') || '4', 10)));
  const transparent = params.get('transparent') === '1';
  const encodingMode = params.get('enc') || 'auto';
  const version = params.get('v') ? Number.parseInt(params.get('v')!, 10) : 0;

  // Mask pattern: 'auto' or 0-7
  const maskPatternParam = params.get('mask');
  const parsedMask = maskPatternParam ? Number.parseInt(maskPatternParam, 10) : NaN;
  const maskPattern: 'auto' | number =
    maskPatternParam === 'auto' || !maskPatternParam || Number.isNaN(parsedMask)
      ? 'auto'
      : Math.min(7, Math.max(0, parsedMask));

  // Character encoding: 'default', 'utf8', or 'shift-jis'
  const charsetParam = params.get('charset') || 'default';
  const characterEncoding = ['default', 'utf8', 'shift-jis'].includes(charsetParam)
    ? charsetParam
    : 'default';
  const borderModulesExtra = Math.min(
    10,
    Math.max(0, Number.parseInt(params.get('border') || '0', 10))
  );
  const quietZoneMinEnforce = params.has('qzEnforce') ? params.get('qzEnforce') !== '0' : undefined;
  const crispEdges = params.get('crisp') !== '0';
  const pixelSnap = params.get('snap') || 'floor';
  const perModuleColorMode = params.get('modColor') || 'solid';
  const contrastGuard = params.get('cGuard') === '1';
  const minContrastRatio = Number.parseFloat(params.get('minContrast') || '4.5');
  const renderSeed = params.get('seed')
    ? Number.parseInt(params.get('seed') || '0', 10)
    : undefined;

  // Module styling
  const moduleStyle = params.get('style') || 'square';
  const finderStyle = params.get('finder') || 'square';
  const eyeOuterStyle = params.get('eyeOuter') || finderStyle;
  const eyeInnerStyle = params.get('eyeInner') || finderStyle;
  const eyeScale = Math.min(
    150,
    Math.max(50, Number.parseInt(params.get('eyeScale') || '100', 10))
  );
  const cornerRadius = Math.min(100, Math.max(0, Number.parseInt(params.get('radius') || '0', 10)));
  const moduleGap = Math.min(50, Math.max(0, Number.parseInt(params.get('gap') || '0', 10)));
  const gapMode = params.get('gapMode') || 'none';
  const dotRotationDeg = Number.parseInt(params.get('dotRot') || '0', 10);

  // Frame
  const frameStyle = params.get('frame') || 'none';
  const frameText = params.get('frameText') || '';

  // Gradient
  const gradientType = params.get('grad') || 'none';
  const gradientAngle = Number.parseInt(params.get('gradAngle') || '0', 10);
  const gradientStopsParam = params.get('gradStops');
  const gradientStops = gradientStopsParam ? parseGradientStops(gradientStopsParam) : undefined;

  // Additional styling
  const alignmentStyle = params.get('align') || 'match_finder';
  const timingStyle = params.get('timing') || 'match_module';

  // Protection settings
  const preserveFinders = params.get('keepFinders') !== '0';
  const preserveTiming = params.get('keepTiming') === '1';
  const preserveAlignment = params.get('keepAlign') === '1';
  const protectFormatInfo = params.get('protectFmt') === '1';
  const protectVersionInfo = params.get('protectVer') === '1';
  const eccAwareEnabled = params.get('eccAware') === '1';
  const eccAwareRiskBudget = Math.min(
    100,
    Math.max(0, Number.parseInt(params.get('eccRisk') || '50', 10))
  );
  const eccAwareWeightMap = params.get('eccMap') || 'distance_to_finders';

  // Overlay
  const overlayUrl = params.get('img');
  // Default to 'dithered' mode when overlay URL is provided but mode is not specified
  // This matches the client-side default in qr-store.ts
  const legacySubpixel = params.get('subpixel') === '1';
  const overlayMode =
    params.get('mode') || (legacySubpixel ? 'subpixel' : overlayUrl ? 'dithered' : undefined);
  const overlayIntensity = Math.min(
    100,
    Math.max(0, Number.parseInt(params.get('intensity') || '100', 10))
  );
  const colorMode = params.get('colorMode') || 'color';
  const logoSize = Math.min(50, Math.max(5, Number.parseInt(params.get('logoSize') || '25', 10)));

  // Overlay preprocessing
  const overlayBrightness = Math.min(
    100,
    Math.max(-100, Number.parseInt(params.get('brightness') || '0', 10))
  );
  const overlayContrast = Math.min(
    100,
    Math.max(-100, Number.parseInt(params.get('contrast') || '0', 10))
  );
  const overlayGamma = Math.max(0.1, Math.min(3, Number.parseFloat(params.get('gamma') || '1')));
  const overlaySaturation = Math.min(
    100,
    Math.max(-100, Number.parseInt(params.get('saturation') || '0', 10))
  );
  const overlayHueRotate = Number.parseInt(params.get('hue') || '0', 10);
  const overlayInvert = params.get('invert') === '1';
  const overlayBlur = Math.max(0, Number.parseInt(params.get('blur') || '0', 10));
  const overlaySharpen = Math.max(0, Number.parseInt(params.get('sharpen') || '0', 10));
  const overlayPosterize = Math.max(0, Number.parseInt(params.get('posterize') || '0', 10));
  const overlayThresholdParam = params.get('threshold');
  const overlayThreshold = overlayThresholdParam
    ? Math.min(255, Math.max(0, Number.parseInt(overlayThresholdParam, 10)))
    : undefined; // Only apply if explicitly specified
  const overlayEdgeDetect = params.get('edge') || 'off';
  const overlayFit = params.get('fit') || 'cover';
  const overlayRotate = Number.parseInt(params.get('rot') || '0', 10);
  const overlayFlipX = params.get('flipX') === '1';
  const overlayFlipY = params.get('flipY') === '1';

  // Dithering options - use cheap default if not specified, otherwise honor user's choice
  const ditherKindParam = params.get('ditherKind');
  const ditherKind = (ditherKindParam || DEFAULT_SERVER_DITHER) as DitherKind;
  const diffusionKernel = params.get('diffusionKernel') || 'floyd_steinberg';
  const ditherStrength = Math.min(
    100,
    Math.max(0, Number.parseInt(params.get('ditherStrength') || '50', 10))
  );
  const finderDitherStrength = Math.min(
    100,
    Math.max(0, Number.parseInt(params.get('finderDither') || '65', 10))
  );
  const ditherSerpentine = params.get('serpentine') === '1';
  const orderedMatrix = params.get('matrix') || 'bayer4';
  const blueNoiseTileSize = Number.parseInt(params.get('bnTile') || '64', 10);
  const blueNoiseSeed = Number.parseInt(params.get('bnSeed') || '0', 10);
  const colorDither = params.get('colorDither') || 'none';

  // Subpixel options
  const subpixelGridSize = params.get('spGrid') || '3x3';
  const subpixelGridNum = params.get('spGridNum')
    ? Number.parseInt(params.get('spGridNum') || '3', 10)
    : undefined;
  const subpixelCenterRule = params.get('spCenter') || 'strict';
  const subpixelNeutralColor = params.get('spNeutral') ? `#${params.get('spNeutral')}` : '#808080';
  const subpixelFinderOverride = params.get('spFinder') || 'solid';

  // Halftone options
  const halftoneCell = params.get('htCell') || 'per_module';
  const halftoneDotShape = params.get('htDot') || 'circle';
  const brightnessCurve = params.get('htCurve') || 'linear';
  const duotoneColor1 = params.get('duo1') ? `#${params.get('duo1')}` : '#000000';
  const duotoneColor2 = params.get('duo2') ? `#${params.get('duo2')}` : '#ffffff';

  // Render palette
  const paletteParam = params.get('palette');
  const palette = paletteParam
    ? paletteParam.split(',').map((c) => (c.startsWith('#') ? c : `#${c}`))
    : undefined;
  // paletteMode is parsed below in the "Render palette" section

  // Safety per-ECC limits (support both short and long param names)
  const maxOverlayIntensityL = Number.parseInt(
    params.get('maxIntL') || params.get('maxOverlayIntensityL') || '100',
    10
  );
  const maxOverlayIntensityM = Number.parseInt(
    params.get('maxIntM') || params.get('maxOverlayIntensityM') || '100',
    10
  );
  const maxOverlayIntensityQ = Number.parseInt(
    params.get('maxIntQ') || params.get('maxOverlayIntensityQ') || '100',
    10
  );
  const maxOverlayIntensityH = Number.parseInt(
    params.get('maxIntH') || params.get('maxOverlayIntensityH') || '100',
    10
  );

  // Output format (may be overridden if overlay is animated GIF)
  // Default to GIF to align with client default (was PNG, causing embed/share mismatch)
  let outputFormat = (params.get('format') || DEFAULT_OUTPUT_FORMAT) as OutputFormat;
  const outputQuality = Math.max(0, Math.min(1, Number.parseFloat(params.get('quality') || '0.9')));
  const outputDpi = Math.max(1, Math.min(1200, Number.parseInt(params.get('dpi') || '72', 10)));

  // Watermark
  const watermarkEnabled = params.get('wmEn') === '1';
  const watermarkKind = (params.get('wmKind') || 'text') as WatermarkKind;
  const watermarkText = params.get('wmText') || '';
  const watermarkImageUrl = params.get('wmImg') || undefined;
  const watermarkPosition = (params.get('wmPos') || 'center') as WatermarkPosition;
  const watermarkOpacity = Math.min(
    100,
    Math.max(0, Number.parseInt(params.get('wmOpacity') || '50', 10))
  );
  const watermarkBlend = (params.get('wmBlend') || 'normal') as WatermarkBlend;

  // Animation (for animated GIF output)
  // NOTE: Some animation params are client-only (moduleJitter requires per-frame QR generation)
  const animationPattern = (params.get('animPattern') || 'none') as AnimationPattern;
  const animationLoop = params.get('loop') !== '0';
  const animationBounce = params.get('bounce') === '1';
  const animationReverse = params.get('reverse') === '1';
  const animationColorCycle = params.get('colorCycle') === '1';
  const animationInterpolate = params.get('interp') || 'none';
  const animationTemporalDither = params.get('tempDither') || 'off';
  const animationStartFrame = Number.parseInt(params.get('startF') || '0', 10);
  const animationMaxFrames = Number.parseInt(params.get('maxF') || '0', 10);
  const animationFrameStep = Number.parseInt(params.get('stepF') || '1', 10);
  const animationModuleJitter = Number.parseFloat(params.get('jitter') || '0');
  // Ensure frame count is at least 1 to prevent empty animation loops
  const animationFramesRaw = Number.parseInt(params.get('animFrames') || '24', 10);
  const animationFrames = Math.min(
    60,
    Math.max(1, Number.isNaN(animationFramesRaw) ? 24 : animationFramesRaw)
  );
  // Ensure speed is valid to prevent division issues
  const animationSpeedRaw = Number.parseInt(
    params.get('animSpeed') || params.get('speed') || '100',
    10
  );
  const animationSpeed = Math.min(
    1000,
    Math.max(10, Number.isNaN(animationSpeedRaw) ? 100 : animationSpeedRaw)
  );
  const animationSeed = Number.parseInt(params.get('animSeed') || '0', 10);
  const animationEasing = params.get('easing') || 'linear';

  // Format-specific quality params
  const webpQuality = Math.min(100, Math.max(0, Number.parseInt(params.get('webpQ') || '90', 10)));
  const _jpegQuality = Math.min(100, Math.max(0, Number.parseInt(params.get('jpegQ') || '92', 10)));
  const gifPaletteSize = params.get('gifPal');
  const gifColors = Math.min(
    256,
    Math.max(2, Number.parseInt(params.get('gifColors') || gifPaletteSize || '256', 10))
  );
  const gifQuantizer = params.get('gifQuant') || undefined;
  const gifDither = params.get('gifDith') || undefined;
  const gifTransparentColor = params.get('gifTrans') ? `#${params.get('gifTrans')}` : undefined;
  void gifQuantizer;
  void gifDither;
  void gifTransparentColor;

  // Metadata
  const metaTitle = params.get('metaTitle') || undefined;
  const metaAuthor = params.get('metaAuthor') || undefined;
  const metaCopyright = params.get('metaCopy') || undefined;
  const metaDescription = params.get('metaDesc') || undefined;
  const metaLicense = params.get('metaLic') || undefined;
  const metaCreationTime = params.get('metaTime') === '1';
  const metaCustomKv = params.get('metaKv') || undefined;

  // Crop parameters (missing from server previously)
  const cropEnabled = params.get('cropEn') === '1';
  const cropX = Number.parseFloat(params.get('cropX') || '0.5');
  const cropY = Number.parseFloat(params.get('cropY') || '0.5');
  const cropSize = Number.parseFloat(params.get('cropSize') || '1');

  // Overlay type and frame picking (missing from server previously)
  const overlayType = params.get('ovType') || 'static';
  const overlayFramePick = params.get('ovFramePick') || 'all';

  // GIF-specific overlay parameters
  const gifUseFrameDelays = params.get('gifDelays') !== '0';
  const gifDisposalHandling = params.get('gifDispH') || 'respect';
  const gifMaxFps = Number.parseInt(params.get('gifMaxFps') || '0', 10);

  // Safety locks (missing from server previously)
  const lockFinders = params.get('lockF') !== '0';
  const lockTiming = params.get('lockT') !== '0';
  const lockAlign = params.get('lockA') !== '0';
  const lockFormat = params.get('lockFmt') !== '0';
  const lockVersion = params.get('lockV') !== '0';
  const safetyMode = params.get('safeMode') || 'off';
  const safetyMinModulePx = Number.parseInt(params.get('safeMinPx') || '2', 10);
  const safetyMinQuietZone = Number.parseInt(params.get('safeMinQz') || '4', 10);

  // Auto-tuning (missing from server previously - these are hints)
  const autoPickVersion = params.get('autoVer') !== '0';
  const autoPickEcc = params.get('autoEcc') === '1';
  const autoReduceIntensity = params.get('autoReduce') === '1';

  // QA parameters - CLIENT-ONLY: These require interactive canvas manipulation
  // and scan validation loops that aren't feasible server-side.
  // Parsed for URL compatibility but not applied.
  const qaContrastCheckClientOnly = params.get('qaContrast') === '1';
  const qaSimulateBlurClientOnly = Number.parseFloat(params.get('qaBlur') || '0');
  const qaSimulateNoiseClientOnly = Number.parseInt(params.get('qaNoise') || '0', 10);
  const qaSimulateRotationClientOnly = Number.parseInt(params.get('qaRot') || '0', 10);
  const qaShowHeatmapClientOnly = params.get('qaHeatmap') === '1';
  // Log if QA params are requested but can't be applied
  if (
    qaContrastCheckClientOnly ||
    qaSimulateBlurClientOnly ||
    qaSimulateNoiseClientOnly ||
    qaSimulateRotationClientOnly ||
    qaShowHeatmapClientOnly
  ) {
  }

  // Output extras (missing from server previously)
  const bgOverride = params.get('bgOver') ? `#${params.get('bgOver')}` : undefined;
  const formatExtra = params.get('fmtExtra') || 'none';
  const filename = params.get('fname') || 'anqr-qrcode';
  const includeQuietZone = params.get('inclQz') !== '0';
  const gifDisposal = params.get('gifDisp') || 'restore_bg';
  const gifDisposalCode =
    gifDisposal === 'none'
      ? 0
      : gifDisposal === 'keep'
        ? 1
        : gifDisposal === 'restore_previous'
          ? 3
          : 2;
  const svgTrueVector = params.get('svgVec') === '1';
  const svgShapePrecision = params.get('svgPrec') || 'pixel';
  const svgEmbedRasterOverlay = params.get('svgEmbed') !== '0';
  void svgTrueVector;

  // Render palette (missing from server previously)
  const paletteMode = params.get('paletteMode') || 'position';

  // Validate ECC level
  if (!['L', 'M', 'Q', 'H'].includes(ec)) {
    return new Response('Invalid "ec" parameter. Use L, M, Q, or H', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Validate module style
  const validModuleStyles = ['square', 'rounded', 'dots', 'diamond', 'connected'];
  if (!validModuleStyles.includes(moduleStyle)) {
    return new Response(`Invalid "style" parameter. Use one of: ${validModuleStyles.join(', ')}`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Create QRGenerator with Node.js canvas factory
    const qrGenerator = new QRGenerator(nodeCanvasFactory);

    // Calculate module size based on desired output size
    // Estimate module count first (depends on content length and ECC)
    const estimatedVersion = calculateOptimalVersion(data, ec);
    const estimatedModuleCount = estimatedVersion * 4 + 17;
    // Use final margin (including borderModulesExtra) for module size calculation
    // to avoid sizing drift/crop issues
    const totalMargin = margin + borderModulesExtra;
    // If modulePx is explicitly provided, use it (matches client behavior)
    // Otherwise, calculate from output size for backward compatibility
    const moduleSize = modulePxParam
      ? Math.max(1, Math.min(50, modulePxParam))
      : Math.max(
          1,
          Math.floor((size - totalMargin * 2) / (estimatedModuleCount + totalMargin * 2))
        );

    // Build config (same structure as client-side)
    const config = {
      content: data,
      typeNumber: version, // 0 = auto-detect
      errorCorrection: ec,
      encodingMode,
      maskPattern,
      characterEncoding,
      seed: renderSeed,
      moduleSize,
      margin: margin + borderModulesExtra,
      quietZoneMinEnforce,
      crispEdges,
      pixelSnap,
      fgColor: `#${fg}`,
      bgColor: `#${bg}`,
      transparentBg: transparent,
      moduleStyle,
      finderStyle,
      alignmentStyle,
      timingStyle,
      eyeOuterStyle,
      eyeInnerStyle,
      eyeScale,
      cornerRadius,
      moduleGap,
      gapMode,
      dotRotationDeg,
      frameStyle,
      frameText,
      perModuleColorMode,
      contrastGuard,
      minContrastRatio,
      overlayMode,
      overlayIntensity,
      colorMode,
      logoSize,
      preserveFinders,
      preserveTiming,
      preserveAlignment,
      protectFormatInfo,
      protectVersionInfo,
      eccAwareEnabled,
      eccAwareRiskBudget,
      eccAwareWeightMap,
      overlayBrightness,
      overlayContrast,
      overlayGamma,
      overlaySaturation,
      overlayHueRotate,
      invertImage: overlayInvert,
      overlayBlur,
      overlaySharpen,
      overlayPosterize,
      overlayThreshold,
      overlayEdgeDetect,
      overlayFit,
      overlayRotate,
      overlayFlipX,
      overlayFlipY,
      // Dither options
      ditherKind,
      diffusionKernel,
      ditherStrength,
      finderDitherStrength,
      ditherSerpentine,
      orderedMatrix,
      blueNoiseTileSize,
      blueNoiseSeed,
      colorDither,
      // Subpixel options
      subpixelGridSize,
      subpixelGrid: subpixelGridNum,
      subpixelCenterRule,
      subpixelNeutralColor,
      subpixelFinderOverride,
      // Halftone options
      halftoneCell,
      halftoneDotShape,
      brightnessCurve,
      duotoneColors: [duotoneColor1, duotoneColor2],
      // Palette
      palette,
      gradient:
        gradientType === 'none'
          ? undefined
          : {
              type: gradientType,
              angle: gradientAngle,
              stops: gradientStops,
            },
      // Per-ECC intensity limits
      maxOverlayIntensityByEcc: {
        L: maxOverlayIntensityL,
        M: maxOverlayIntensityM,
        Q: maxOverlayIntensityQ,
        H: maxOverlayIntensityH,
      },
      // Animation settings (pattern-based animation is supported server-side)
      animationPattern,
      animationFrames,
      animationSpeed,
      animationSeed,
      animationLoop,
      animationBounce,
      animationReverse,
      animationInterpolate,
      animationTemporalDither,
      animationStartFrame,
      animationMaxFrames,
      animationFrameStep,
      moduleJitterPx: animationModuleJitter, // Limited server-side support
      colorCycle: animationColorCycle, // Supported via color cycle pattern
      // Crop settings
      cropEnabled,
      cropX,
      cropY,
      cropSize,
      // Overlay type
      overlayType,
      overlayFramePick,
      // GIF overlay
      gifUseFrameDelays,
      gifDisposalHandling,
      // Safety locks
      lockFinders,
      lockTiming,
      lockAlign,
      lockFormat,
      lockVersion,
      safetyMode,
      safetyMinModulePx,
      safetyMinQuietZone,
      // Auto-tuning hints
      autoPickVersion,
      autoPickEcc,
      autoReduceIntensity,
      // Output extras
      bgOverride,
      formatExtra,
      filename,
      includeQuietZone,
      svgShapePrecision,
      svgEmbedRasterOverlay,
      // Palette
      paletteMode,
    };

    // Load overlay image if URL provided
    let overlayCanvas: Canvas | null = null;
    let overlayFrames: ServerAnimationFrame[] = [];
    let hasAnimatedOverlay = false;

    if (overlayUrl && overlayMode) {
      const fetchedImage = await fetchImageWithBuffer(overlayUrl);
      if (fetchedImage) {
        // Pre-calculate filter flags once
        const hasFilters =
          overlayBrightness !== 0 ||
          overlayContrast !== 0 ||
          overlayGamma !== 1 ||
          overlaySaturation !== 0 ||
          overlayHueRotate !== 0 ||
          overlayInvert ||
          overlayBlur > 0 ||
          overlaySharpen > 0 ||
          overlayPosterize > 1 ||
          overlayEdgeDetect !== 'off';

        const filterOptions = {
          brightness: overlayBrightness,
          contrast: overlayContrast,
          gamma: overlayGamma,
          saturation: overlaySaturation,
          hue: overlayHueRotate,
          invert: overlayInvert,
          blur: overlayBlur,
          sharpen: overlaySharpen,
          posterize: overlayPosterize,
          threshold: overlayThreshold, // Only applied if explicitly specified via URL param
          edge: overlayEdgeDetect as 'off' | 'sobel' | 'canny',
        };

        // Helper to apply all preprocessing to a canvas
        const preprocessCanvas = (canvas: Canvas): Canvas => {
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
        };

        // Auto-detect animated GIF overlay and switch output format to GIF
        if (fetchedImage.isAnimatedGif) {
          outputFormat = 'gif';
          hasAnimatedOverlay = true;
          // Parse frames and apply preprocessing to each
          const rawFrames = parseGifFramesServer(
            fetchedImage.arrayBuffer,
            gifDisposalHandling === 'simplify' ? 'simplify' : 'respect'
          );
          overlayFrames = rawFrames.map((frame) => ({
            ...frame,
            canvas: preprocessCanvas(frame.canvas),
          }));
          if (gifMaxFps > 0 && overlayFrames.length > 1 && !Number.isNaN(gifMaxFps)) {
            overlayFrames = decimateFramesToMaxFps(overlayFrames, gifMaxFps);
          }
          // For animated GIFs, use the first preprocessed frame as the static overlay
          overlayCanvas = overlayFrames[0]?.canvas ?? preprocessCanvas(fetchedImage.canvas);
        } else {
          // Static overlay - preprocess once
          overlayCanvas = preprocessCanvas(fetchedImage.canvas);
        }
      }
    }

    // Generate QR code using the same method as client-side
    let canvas = await qrGenerator.generate(config, overlayCanvas);

    // Load watermark image if URL provided
    let watermarkImageCanvas: Canvas | null = null;
    if (
      watermarkEnabled &&
      (watermarkKind === 'image' || watermarkKind === 'pattern') &&
      watermarkImageUrl
    ) {
      watermarkImageCanvas = await fetchImageAsCanvas(watermarkImageUrl);
    }

    // Apply watermark if enabled
    if (watermarkEnabled) {
      canvas = applyWatermarkServer(canvas, {
        enabled: watermarkEnabled,
        kind: watermarkKind,
        text: watermarkText,
        imageCanvas: watermarkImageCanvas,
        position: watermarkPosition,
        opacity: watermarkOpacity,
        blend: watermarkBlend,
      });
    }

    // Scale to requested output dimensions
    let outputCanvas = canvas;
    if (canvas.width !== outputWidth || canvas.height !== outputHeight) {
      outputCanvas = createCanvas(outputWidth, outputHeight);
      const ctx = outputCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, outputWidth, outputHeight);
    }

    // Build metadata object
    const metadata: PngMetadata | undefined =
      metaTitle ||
      metaAuthor ||
      metaCopyright ||
      metaDescription ||
      metaLicense ||
      metaCreationTime ||
      metaCustomKv
        ? {
            title: metaTitle,
            author: metaAuthor,
            copyright: metaCopyright,
            description: metaDescription,
            creationTime: metaCreationTime ? new Date().toISOString() : undefined,
            software: 'ANQR - anqr.link',
            // Custom key-value pairs are stored in description if provided
            // Format: key1=value1;key2=value2
            ...(metaCustomKv && !metaDescription ? { description: metaCustomKv } : {}),
          }
        : undefined;

    // Generate animation frames based on source
    let animationFrameCanvases: Canvas[] = [];
    const animatedOverlayFrames: ServerAnimationFrame[] = [];

    if (outputFormat === 'gif') {
      if (hasAnimatedOverlay && overlayFrames.length > 1) {
        // Animated GIF overlay - generate a QR frame for each overlay frame
        for (const overlayFrame of overlayFrames) {
          const frameCanvas = await qrGenerator.generate(config, overlayFrame.canvas);

          // Scale to output size if needed
          let scaledFrame = frameCanvas;
          if (frameCanvas.width !== outputWidth || frameCanvas.height !== outputHeight) {
            scaledFrame = createCanvas(outputWidth, outputHeight);
            const ctx = scaledFrame.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(frameCanvas, 0, 0, outputWidth, outputHeight);
          }

          // Apply watermark if enabled
          if (watermarkEnabled) {
            scaledFrame = applyWatermarkServer(scaledFrame, {
              enabled: watermarkEnabled,
              kind: watermarkKind,
              text: watermarkText,
              imageCanvas: watermarkImageCanvas,
              position: watermarkPosition,
              opacity: watermarkOpacity,
              blend: watermarkBlend,
            });
          }

          animatedOverlayFrames.push({
            canvas: scaledFrame,
            delay: overlayFrame.delay,
            disposalType: overlayFrame.disposalType,
          });
        }
      } else if (animationPattern !== 'none') {
        // Pattern-based animation
        animationFrameCanvases = generatePatternFramesServer(
          outputCanvas,
          animationPattern,
          animationFrames,
          animationSeed,
          animationEasing as AnimationEasing
        );
      }
    }

    // Encode based on format
    let outputBuffer: Buffer;
    let contentType: string;

    switch (outputFormat) {
      case 'gif':
        if (animatedOverlayFrames.length > 1) {
          // Animated GIF from overlay frames (preserves original frame delays)
          outputBuffer = encodeAnimatedGifWithDelays(
            animatedOverlayFrames,
            gifColors,
            gifDisposalCode
          );
        } else if (animationFrameCanvases.length > 1) {
          // Animated GIF with pattern
          outputBuffer = encodeAnimatedGif(
            animationFrameCanvases,
            animationSpeed,
            gifColors,
            gifDisposalCode
          );
        } else {
          // Single frame GIF
          outputBuffer = encodeGif(outputCanvas, gifColors, gifDisposalCode);
        }
        contentType = 'image/gif';
        break;

      case 'webp': {
        // Use webpQuality (0-100) or outputQuality (0-1) if specified
        const finalWebpQuality = webpQuality !== 90 ? webpQuality : Math.round(outputQuality * 100);
        outputBuffer = outputCanvas.toBuffer('image/webp', finalWebpQuality);
        contentType = 'image/webp';
        break;
      }
      default:
        outputBuffer = outputCanvas.toBuffer('image/png');
        // Embed metadata and DPI into PNG
        if (metadata || outputDpi !== 72) {
          outputBuffer = embedPngMetadataAndDpi(outputBuffer, metadata, outputDpi);
        }
        contentType = 'image/png';
        break;
    }

    // Generate ETag from content hash (deterministic output = consistent ETag)
    const etag = `"${createHash('md5').update(outputBuffer).digest('hex')}"`;

    return new Response(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: etag,
        Vary: 'Accept-Encoding',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Report error to Sentry
    Sentry.captureException(error);
    return new Response(`Error generating QR code: ${message}`, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export default handler;

export const __test = {
  nodeCanvasFactory,
  isPrivateOrReservedIP,
  _isPrivateHostname,
  createTextWatermark,
  getWatermarkPositions,
  applyBlendMode,
  applyWatermarkServer,
  calculateCrc32,
  createPngTextChunk,
  createPngPhysChunk,
  embedPngMetadataAndDpi,
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
  encodeAnimatedGifWithDelays,
  parseGradientStops,
  fetchImageWithBuffer,
  fetchImageAsCanvas,
};
