/**
 * Exporter Module
 * Handles PNG, WebP, GIF, and SVG export with full color support
 * Uses gifenc npm package for high-quality GIF encoding
 * Supports native file saving on Android/iOS via Capacitor
 */

import { Capacitor } from '@capacitor/core';
import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { saveBase64ToDocuments } from './media-store-writer';
import {
  getAlignmentPatternCenters,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
} from './qr-core';

// ============================================
// TYPES
// ============================================

export type OutputFormat = 'png' | 'webp' | 'gif' | 'svg' | 'jpeg';

export interface ExportConfig {
  outputFormat: OutputFormat;
  outputWidth: number;
  outputHeight: number;
  outputQuality: number; // 0-1
  filename: string;
  animationSpeed: number; // ms per frame
  loopAnimation: boolean;
  transparentBackground: boolean;
  dpi: number;
  includeMetadata: boolean;
  includeQuietZone: boolean; // If false, crop quiet zone from output
  bgOverride: string; // Override background color (empty = use original)
  gifDisposal: string; // GIF frame disposal method
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
  };
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: OutputFormat;
  width: number;
  height: number;
}

// ============================================
// PNG METADATA EMBEDDING
// ============================================

/**
 * Create PNG pHYs chunk for DPI embedding
 */
function createPngPhysChunk(dpi: number): Uint8Array {
  // Convert DPI to pixels per meter (1 inch = 0.0254 meters)
  const pixelsPerMeter = Math.round(dpi / 0.0254);

  // pHYs chunk: 4 bytes X pixels per unit, 4 bytes Y pixels per unit, 1 byte unit specifier
  const chunkData = new Uint8Array(9);
  const dataView = new DataView(chunkData.buffer);

  // X pixels per unit (big-endian)
  dataView.setUint32(0, pixelsPerMeter, false);
  // Y pixels per unit (big-endian)
  dataView.setUint32(4, pixelsPerMeter, false);
  // Unit specifier: 1 = meter
  chunkData[8] = 1;

  // Create full chunk with length, type, data, CRC
  const chunkType = new TextEncoder().encode('pHYs');
  const chunk = new Uint8Array(4 + 4 + 9 + 4);
  const chunkView = new DataView(chunk.buffer);

  // Length
  chunkView.setUint32(0, 9, false);
  // Type
  chunk.set(chunkType, 4);
  // Data
  chunk.set(chunkData, 8);
  // CRC
  const crcData = new Uint8Array(4 + 9);
  crcData.set(chunkType, 0);
  crcData.set(chunkData, 4);
  const crc = calculateCrc32(crcData);
  chunkView.setUint32(17, crc, false);

  return chunk;
}

/**
 * Embed DPI into PNG blob
 */
async function embedPngDpi(pngBlob: Blob, dpi: number): Promise<Blob> {
  if (!dpi || dpi <= 0) return pngBlob;

  const arrayBuffer = await pngBlob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Find IHDR chunk end (it's always first after signature)
  // PNG signature is 8 bytes, IHDR length is 4 bytes, type is 4 bytes, data is 13 bytes, CRC is 4 bytes
  const ihdrEnd = 8 + 4 + 4 + 13 + 4; // = 33

  // Create pHYs chunk
  const physChunk = createPngPhysChunk(dpi);

  // Insert pHYs chunk after IHDR
  const newPng = new Uint8Array(data.length + physChunk.length);
  newPng.set(data.slice(0, ihdrEnd), 0);
  newPng.set(physChunk, ihdrEnd);
  newPng.set(data.slice(ihdrEnd), ihdrEnd + physChunk.length);

  return new Blob([newPng], { type: 'image/png' });
}

export interface PngMetadata {
  title?: string;
  author?: string;
  description?: string;
  copyright?: string;
  creationTime?: string;
  software?: string;
  comment?: string;
  [key: string]: string | undefined;
}

/**
 * Create a PNG iTXt chunk for metadata embedding (UTF-8 safe)
 * Using iTXt instead of tEXt because tEXt requires Latin-1 encoding,
 * while iTXt properly supports UTF-8 for international text.
 */
function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  // iTXt chunk structure:
  // keyword (1-79 bytes) + null + compression flag (1 byte) + compression method (1 byte)
  // + language tag + null + translated keyword + null + text
  // For uncompressed UTF-8: compression=0, method=0, language="", translated=""
  const compressionFlag = 0; // No compression
  const compressionMethod = 0;
  const languageTag = new Uint8Array(0); // Empty language tag
  const translatedKeyword = new Uint8Array(0); // Empty translated keyword

  // Calculate chunk data size
  const chunkDataSize =
    keywordBytes.length +
    1 +
    1 +
    1 +
    languageTag.length +
    1 +
    translatedKeyword.length +
    1 +
    textBytes.length;
  const chunkData = new Uint8Array(chunkDataSize);

  let offset = 0;
  chunkData.set(keywordBytes, offset);
  offset += keywordBytes.length;
  chunkData[offset++] = 0; // Null separator after keyword
  chunkData[offset++] = compressionFlag;
  chunkData[offset++] = compressionMethod;
  // Language tag (empty) + null
  offset += languageTag.length;
  chunkData[offset++] = 0;
  // Translated keyword (empty) + null
  offset += translatedKeyword.length;
  chunkData[offset++] = 0;
  // UTF-8 text (no null terminator needed)
  chunkData.set(textBytes, offset);

  // Create full chunk: length (4 bytes) + type (4 bytes) + data + CRC (4 bytes)
  const chunkType = new TextEncoder().encode('iTXt');
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);

  // Length (big-endian)
  const dataView = new DataView(chunk.buffer);
  dataView.setUint32(0, chunkData.length, false);

  // Type
  chunk.set(chunkType, 4);

  // Data
  chunk.set(chunkData, 8);

  // CRC32 over type + data
  const crcData = new Uint8Array(4 + chunkData.length);
  crcData.set(chunkType, 0);
  crcData.set(chunkData, 4);
  const crc = calculateCrc32(crcData);
  dataView.setUint32(8 + chunkData.length, crc, false);

  return chunk;
}

/**
 * CRC32 calculation for PNG chunks
 */
function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  // CRC32 lookup table
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
 * Embed metadata into PNG blob
 */
async function embedPngMetadata(pngBlob: Blob, metadata: PngMetadata): Promise<Blob> {
  const arrayBuffer = await pngBlob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Verify PNG signature
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (const [i, sigByte] of pngSignature.entries()) {
    if (data[i] !== sigByte) {
      console.warn('Invalid PNG signature, returning original');
      return pngBlob;
    }
  }

  // Create metadata chunks
  const metadataChunks: Uint8Array[] = [];

  // Standard PNG text keywords
  const keywordMap: Record<string, string> = {
    title: 'Title',
    author: 'Author',
    description: 'Description',
    copyright: 'Copyright',
    creationTime: 'Creation Time',
    software: 'Software',
    comment: 'Comment',
  };

  for (const entry of Object.entries(metadata)) {
    const [key, value] = entry;
    if (value && typeof value === 'string') {
      const keyword = keywordMap[key] || key;
      metadataChunks.push(createPngTextChunk(keyword, value));
    }
  }

  if (metadataChunks.length === 0) {
    return pngBlob;
  }

  // Find IEND chunk position - search for IEND type
  let iendPos = -1;
  for (let i = 8; i < data.length - 8; i++) {
    if (data[i + 4] === 73 && data[i + 5] === 69 && data[i + 6] === 78 && data[i + 7] === 68) {
      // IEND
      iendPos = i;
      break;
    }
  }

  if (iendPos === -1) {
    console.warn('Could not find IEND chunk, returning original');
    return pngBlob;
  }

  // Calculate total size of metadata chunks
  const metadataSize = metadataChunks.reduce((sum, chunk) => sum + chunk.length, 0);

  // Create new PNG with metadata inserted before IEND
  const newPng = new Uint8Array(data.length + metadataSize);

  // Copy everything before IEND
  newPng.set(data.slice(0, iendPos), 0);

  // Insert metadata chunks
  let offset = iendPos;
  for (const chunk of metadataChunks) {
    newPng.set(chunk, offset);
    offset += chunk.length;
  }

  // Copy IEND chunk (and anything after, though there shouldn't be)
  newPng.set(data.slice(iendPos), offset);

  return new Blob([newPng], { type: 'image/png' });
}

// ============================================
// IMAGE EXPORT
// ============================================

/**
 * Export canvas as PNG or WebP image
 */
export async function exportImage(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
  pngMetadata?: PngMetadata,
  dpi?: number
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: config.outputFormat ?? 'png',
    outputWidth: config.outputWidth ?? canvas.width,
    outputHeight: config.outputHeight ?? canvas.height,
    outputQuality: config.outputQuality ?? 0.9,
    filename: config.filename ?? 'anqr-qrcode',
    animationSpeed: config.animationSpeed ?? 100,
    loopAnimation: config.loopAnimation ?? true,
    transparentBackground: config.transparentBackground ?? false,
    dpi: config.dpi ?? 72,
    includeMetadata: config.includeMetadata ?? false,
    includeQuietZone: config.includeQuietZone ?? true,
    bgOverride: config.bgOverride ?? '',
    gifDisposal: config.gifDisposal ?? 'restore_bg',
    metadata: config.metadata,
  };

  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  const format = mimeTypes[opts.outputFormat] ?? 'image/png';

  const quality = opts.outputQuality;

  // Scale canvas to output dimensions
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = opts.outputWidth;
  outputCanvas.height = opts.outputHeight;
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Apply background override if specified
  if (opts.bgOverride?.trim()) {
    ctx.fillStyle = opts.bgOverride;
    ctx.fillRect(0, 0, opts.outputWidth, opts.outputHeight);
  }

  // Use high quality scaling
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, opts.outputWidth, opts.outputHeight);

  let blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      format,
      quality
    );
  });

  // Embed PNG metadata if provided
  if (pngMetadata && format === 'image/png') {
    try {
      blob = await embedPngMetadata(blob, pngMetadata);
    } catch (err) {
      console.warn('Failed to embed PNG metadata:', err);
    }
  }

  // Embed DPI if provided
  if (dpi && dpi > 0 && format === 'image/png') {
    try {
      blob = await embedPngDpi(blob, dpi);
    } catch (err) {
      console.warn('Failed to embed PNG DPI:', err);
    }
  }

  const extensionMap: Record<string, string> = {
    webp: 'webp',
    jpeg: 'jpg',
    png: 'png',
  };
  const ext = extensionMap[opts.outputFormat] ?? 'png';

  const filename = `${opts.filename}.${ext}`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: opts.outputFormat,
    width: opts.outputWidth,
    height: opts.outputHeight,
  };
}

/**
 * Download an image from canvas
 */
export async function downloadImage(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
  pngMetadata?: PngMetadata,
  dpi?: number
): Promise<void> {
  const result = await exportImage(canvas, config, pngMetadata, dpi);
  downloadUrl(result.url, result.filename, result.blob);
  // Don't revoke URL immediately on native - file save is async
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}

// ============================================
// GIF EXPORT
// ============================================

/**
 * Export animation frames as GIF
 * OPTIMIZED: Uses global palette strategy for consistent colors across frames
 * and respects gifPaletteSize configuration
 */
export async function exportGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[] // Optional per-frame delays in ms
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: 'gif',
    outputWidth: config.outputWidth ?? frames[0]?.width ?? 400,
    outputHeight: config.outputHeight ?? frames[0]?.height ?? 400,
    outputQuality: config.outputQuality ?? 0.9,
    filename: config.filename ?? 'anqr-qrcode',
    animationSpeed: config.animationSpeed ?? 100,
    loopAnimation: config.loopAnimation ?? true,
    transparentBackground: config.transparentBackground ?? false,
    dpi: config.dpi ?? 72,
    includeMetadata: config.includeMetadata ?? false,
    includeQuietZone: config.includeQuietZone ?? true,
    bgOverride: config.bgOverride ?? '',
    gifDisposal: config.gifDisposal ?? 'restore_bg',
    metadata: config.metadata,
  };

  const width = opts.outputWidth;
  const height = opts.outputHeight;
  const defaultDelay = opts.animationSpeed;
  const repeat = opts.loopAnimation ? 0 : -1; // 0 = loop forever, -1 = no loop

  // Get palette size from config (default 256, clamped to valid range 2-256)
  const paletteSize = Math.max(
    2,
    Math.min(256, (config as { gifPaletteSize?: number }).gifPaletteSize ?? 256)
  );

  // Create GIF encoder
  const gif = GIFEncoder();

  // OPTIMIZATION: Reuse a single scaling canvas for all frames
  // This avoids O(n) canvas creation overhead
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = width;
  scaledCanvas.height = height;
  const scaledCtx = scaledCanvas.getContext('2d');
  if (!scaledCtx) throw new Error('Could not get canvas context');

  // Pre-compute disposal code once (not per-frame)
  const disposalMap: Record<string, number> = {
    none: 0,
    keep: 1,
    restore_bg: 2,
    restore_previous: 3,
  };
  const disposal = disposalMap[opts.gifDisposal] ?? 2;

  // Check if we need to apply background
  const hasBgOverride = opts.bgOverride?.trim();

  // GLOBAL PALETTE STRATEGY: Build palette from first frame (or sample multiple frames for longer animations)
  // This ensures consistent colors across all frames and is much faster than per-frame quantization
  let globalPalette: number[][] | null = null;

  if (frames.length > 0) {
    // For animations with many frames, sample a few representative frames to build palette
    const framesToSample =
      frames.length > 10 ? [0, Math.floor(frames.length / 2), frames.length - 1] : [0];

    // Pre-calculate total size needed for sampled pixels
    const pixelsPerFrame = width * height * 4; // RGBA
    const totalPixels = framesToSample.length * pixelsPerFrame;
    const sampledPixels = new Uint8ClampedArray(totalPixels);
    let offset = 0;

    for (const frameIdx of framesToSample) {
      const frame = frames[frameIdx];
      if (!frame) continue;

      scaledCtx.clearRect(0, 0, width, height);
      if (hasBgOverride) {
        scaledCtx.fillStyle = opts.bgOverride;
        scaledCtx.fillRect(0, 0, width, height);
      }
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(frame, 0, 0, width, height);

      const imageData = scaledCtx.getImageData(0, 0, width, height);
      // Copy pixels directly into the pre-allocated buffer
      sampledPixels.set(imageData.data, offset);
      offset += imageData.data.length;
    }

    // Build global palette from sampled pixels (quantize accepts Uint8ClampedArray)
    globalPalette = quantize(sampledPixels, paletteSize);
  }

  // Encode each frame using the global palette
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    // Use per-frame delay if provided, otherwise use default
    const frameDelay = frameDelays?.[i] ? frameDelays[i] : defaultDelay;

    // Clear and reuse the scaling canvas
    scaledCtx.clearRect(0, 0, width, height);

    // Apply background override if specified
    if (hasBgOverride) {
      scaledCtx.fillStyle = opts.bgOverride;
      scaledCtx.fillRect(0, 0, width, height);
    }

    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(frame, 0, 0, width, height);

    // Get RGBA pixel data
    const imageData = scaledCtx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Use global palette (or fall back to per-frame for single frames)
    const palette = globalPalette || quantize(data, paletteSize);

    // Apply palette to get indexed pixel data
    const index = applyPalette(data, palette);

    // Convert milliseconds to centiseconds (gifenc uses 1/100th seconds, like the GIF spec)
    // Use a minimum of 2 centiseconds (20ms) - browsers interpret <2cs as 10cs anyway
    const delayCentiseconds = Math.max(2, Math.round(frameDelay / 10));

    gif.writeFrame(index, width, height, {
      palette,
      delay: delayCentiseconds,
      disposal,
      ...(i === 0 && { repeat }),
    });
  }

  // Finish encoding
  gif.finish();

  // Get the encoded GIF bytes
  const bytes = gif.bytes();
  const blob = new Blob([bytes], { type: 'image/gif' });
  const filename = `${opts.filename}.gif`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: 'gif',
    width,
    height,
  };
}

/**
 * Download animation as GIF
 */
export async function downloadGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[]
): Promise<void> {
  const result = await exportGif(frames, config, frameDelays);
  downloadUrl(result.url, result.filename, result.blob);
  // Don't revoke URL immediately on native - file save is async
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}

// ============================================
// SVG EXPORT
// ============================================

/**
 * Export canvas as SVG (embedded raster)
 */
export async function exportSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {}
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: 'svg',
    outputWidth: config.outputWidth ?? canvas.width,
    outputHeight: config.outputHeight ?? canvas.height,
    outputQuality: config.outputQuality ?? 0.9,
    filename: config.filename ?? 'anqr-qrcode',
    animationSpeed: config.animationSpeed ?? 100,
    loopAnimation: config.loopAnimation ?? true,
    transparentBackground: config.transparentBackground ?? false,
    dpi: config.dpi ?? 72,
    includeMetadata: config.includeMetadata ?? false,
    includeQuietZone: config.includeQuietZone ?? true,
    bgOverride: config.bgOverride ?? '',
    gifDisposal: config.gifDisposal ?? 'restore_bg',
    metadata: config.metadata,
  };

  const dataUrl = canvas.toDataURL('image/png');

  let metadata = '';
  if (opts.includeMetadata && opts.metadata) {
    const m = opts.metadata;
    if (m.title) metadata += `  <title>${escapeXml(m.title)}</title>\n`;
    if (m.description) metadata += `  <desc>${escapeXml(m.description)}</desc>\n`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${opts.outputWidth}" height="${opts.outputHeight}"
     viewBox="0 0 ${opts.outputWidth} ${opts.outputHeight}">
${metadata}  <image width="${opts.outputWidth}" height="${opts.outputHeight}" xlink:href="${dataUrl}"/>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const filename = `${opts.filename}.svg`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: 'svg',
    width: opts.outputWidth,
    height: opts.outputHeight,
  };
}

/**
 * Module style types for vector SVG
 */
export type VectorModuleStyle = 'square' | 'rounded' | 'dots' | 'diamond' | 'connected';
export type VectorFinderStyle = 'square' | 'rounded' | 'circle';
export type VectorAlignmentStyle = 'match_finder' | 'square' | 'rounded' | 'circle';
export type VectorTimingStyle = 'match_module' | 'solid' | 'dashed';
interface VectorGradient {
  type: 'none' | 'linear' | 'radial' | 'conic';
  stops: Array<{ pos: number; color: string }>;
  angle?: number;
}

/**
 * Configuration for styled vector SVG export
 */
export interface VectorSvgConfig {
  moduleSize?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  filename?: string;
  moduleStyle?: VectorModuleStyle;
  cornerRadius?: number;
  finderStyle?: VectorFinderStyle;
  eyeOuterStyle?: VectorFinderStyle;
  eyeInnerStyle?: VectorFinderStyle;
  alignmentStyle?: VectorAlignmentStyle;
  timingStyle?: VectorTimingStyle;
  gradient?: VectorGradient;
  /** Metadata to embed in the SVG */
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
    creationTime?: boolean;
    software?: string;
  };
}

/**
 * Helper: Get alignment pattern positions for a given moduleCount
 * Wrapper around qr-core's getAlignmentPatternCenters
 */
function getAlignmentPositions(moduleCount: number): Array<{ row: number; col: number }> {
  // Version is derived from moduleCount: version = (moduleCount - 17) / 4
  const version = Math.round((moduleCount - 17) / 4);
  return getAlignmentPatternCenters(version, moduleCount);
}

/**
 * Generate SVG path for a single module with styling
 */
function generateModulePath(
  x: number,
  y: number,
  size: number,
  style: VectorModuleStyle,
  cornerRadius: number
): string {
  const r = (cornerRadius / 100) * (size / 2);

  switch (style) {
    case 'rounded': {
      if (r <= 0) return `M${x},${y}h${size}v${size}h${-size}Z`;
      return (
        `M${x + r},${y}` +
        `h${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${r},${r}` +
        `v${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${-r},${r}` +
        `h${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${-r},${-r}` +
        `v${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${r},${-r}Z`
      );
    }
    case 'dots': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const radius = (size / 2) * 0.85;
      return (
        `M${cx - radius},${cy}` +
        `a${radius},${radius} 0 1 0 ${radius * 2},0` +
        `a${radius},${radius} 0 1 0 ${-radius * 2},0Z`
      );
    }
    case 'diamond': {
      const half = size / 2;
      return `M${x + half},${y}l${half},${half}l${-half},${half}l${-half},${-half}Z`;
    }
    case 'connected': {
      // Connected style: full-size square with no gaps (for connected look)
      // No overlap needed - we use shape-rendering="crispEdges" on the SVG instead
      return `M${x},${y}h${size}v${size}h${-size}Z`;
    }
    default:
      return `M${x},${y}h${size}v${size}h${-size}Z`;
  }
}

/**
 * Generate SVG for finder pattern with styling
 */
function generateFinderSvg(
  startX: number,
  startY: number,
  moduleSize: number,
  outerStyle: VectorFinderStyle,
  innerStyle: VectorFinderStyle,
  fillColor: string
): string {
  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;
  const middleOffset = moduleSize;
  const innerOffset = 2 * moduleSize;

  let paths = '';

  // Outer ring with cutout
  if (outerStyle === 'circle') {
    const cx = startX + outerSize / 2;
    const cy = startY + outerSize / 2;
    const outerR = outerSize / 2;
    const innerR = middleSize / 2;
    paths += `<path d="M${cx - outerR},${cy}a${outerR},${outerR} 0 1 0 ${outerR * 2},0a${outerR},${outerR} 0 1 0 ${-outerR * 2},0Z M${cx - innerR},${cy}a${innerR},${innerR} 0 1 1 ${innerR * 2},0a${innerR},${innerR} 0 1 1 ${-innerR * 2},0Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else if (outerStyle === 'rounded') {
    const r = moduleSize;
    const ir = moduleSize * 0.5;
    const mx = startX + middleOffset;
    const my = startY + middleOffset;
    paths += `<path d="M${startX + r},${startY}h${outerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${outerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${mx + ir},${my}h${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${ir},${ir}v${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${-ir},${ir}h${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${-ir},${-ir}v${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${ir},${-ir}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else {
    paths += `<path d="M${startX},${startY}h${outerSize}v${outerSize}h${-outerSize}Z M${startX + middleOffset},${startY + middleOffset}h${middleSize}v${middleSize}h${-middleSize}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  // Inner center (3x3)
  const ix = startX + innerOffset;
  const iy = startY + innerOffset;
  if (innerStyle === 'circle') {
    const cx = ix + innerSize / 2;
    const cy = iy + innerSize / 2;
    paths += `<circle cx="${cx}" cy="${cy}" r="${innerSize / 2}" fill="${fillColor}"/>`;
  } else if (innerStyle === 'rounded') {
    const r = moduleSize * 0.5;
    paths += `<path d="M${ix + r},${iy}h${innerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${innerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z" fill="${fillColor}"/>`;
  } else {
    paths += `<rect x="${ix}" y="${iy}" width="${innerSize}" height="${innerSize}" fill="${fillColor}"/>`;
  }

  return paths;
}

/**
 * Generate SVG for alignment pattern with styling (5x5 modules)
 * Structure: outer ring (5x5 dark), middle ring (3x3 light cutout), center dot (1x1 dark)
 */
function generateAlignmentSvg(
  centerX: number,
  centerY: number,
  moduleSize: number,
  style: VectorAlignmentStyle,
  finderStyle: VectorFinderStyle,
  fillColor: string
): string {
  // Use finder style if 'match_finder' is specified
  const effectiveStyle: VectorFinderStyle =
    style === 'match_finder' ? finderStyle : (style as VectorFinderStyle);

  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const startX = centerX - outerSize / 2;
  const startY = centerY - outerSize / 2;
  const middleOffset = moduleSize;
  const innerOffset = 2 * moduleSize;

  let paths = '';

  // Outer ring with middle cutout
  if (effectiveStyle === 'circle') {
    const outerR = outerSize / 2;
    const middleR = middleSize / 2;
    paths += `<path d="M${centerX - outerR},${centerY}a${outerR},${outerR} 0 1 0 ${outerR * 2},0a${outerR},${outerR} 0 1 0 ${-outerR * 2},0Z M${centerX - middleR},${centerY}a${middleR},${middleR} 0 1 1 ${middleR * 2},0a${middleR},${middleR} 0 1 1 ${-middleR * 2},0Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else if (effectiveStyle === 'rounded') {
    const r = moduleSize * 0.5;
    const ir = moduleSize * 0.3;
    const mx = startX + middleOffset;
    const my = startY + middleOffset;
    paths += `<path d="M${startX + r},${startY}h${outerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${outerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(outerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${mx + ir},${my}h${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${ir},${ir}v${middleSize - 2 * ir}a${ir},${ir} 0 0 1 ${-ir},${ir}h${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${-ir},${-ir}v${-(middleSize - 2 * ir)}a${ir},${ir} 0 0 1 ${ir},${-ir}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  } else {
    // Square style
    paths += `<path d="M${startX},${startY}h${outerSize}v${outerSize}h${-outerSize}Z M${startX + middleOffset},${startY + middleOffset}h${middleSize}v${middleSize}h${-middleSize}Z" fill="${fillColor}" fill-rule="evenodd"/>`;
  }

  // Center dot (1x1)
  const ix = startX + innerOffset;
  const iy = startY + innerOffset;
  if (effectiveStyle === 'circle') {
    paths += `<circle cx="${centerX}" cy="${centerY}" r="${innerSize / 2}" fill="${fillColor}"/>`;
  } else if (effectiveStyle === 'rounded') {
    const r = moduleSize * 0.2;
    paths += `<path d="M${ix + r},${iy}h${innerSize - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${innerSize - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(innerSize - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z" fill="${fillColor}"/>`;
  } else {
    paths += `<rect x="${ix}" y="${iy}" width="${innerSize}" height="${innerSize}" fill="${fillColor}"/>`;
  }

  return paths;
}

/**
 * Generate SVG path for timing pattern modules
 */
function generateTimingModulePath(
  x: number,
  y: number,
  size: number,
  timingStyle: VectorTimingStyle,
  moduleStyle: VectorModuleStyle,
  cornerRadius: number
): string {
  // Use module style if 'match_module' is specified
  if (timingStyle === 'match_module') {
    return generateModulePath(x, y, size, moduleStyle, cornerRadius);
  }

  // 'solid' - full size square
  if (timingStyle === 'solid') {
    return `M${x},${y}h${size}v${size}h${-size}Z`;
  }

  // 'dashed' - smaller centered rectangle for dashed look
  const dashSize = size * 0.7;
  const offset = (size - dashSize) / 2;
  return `M${x + offset},${y + offset}h${dashSize}v${dashSize}h${-dashSize}Z`;
}

/**
 * Generate gradient definition for SVG
 */
function generateGradientDef(gradient: VectorGradient, id: string): string {
  if (gradient.type === 'none' || !gradient.stops?.length) return '';

  const stops = gradient.stops
    .map((s) => `<stop offset="${s.pos * 100}%" stop-color="${s.color}"/>`)
    .join('');

  switch (gradient.type) {
    case 'linear': {
      const angle = gradient.angle ?? 0;
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 - Math.cos(rad) * 50;
      const y1 = 50 - Math.sin(rad) * 50;
      const x2 = 50 + Math.cos(rad) * 50;
      const y2 = 50 + Math.sin(rad) * 50;
      return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
    }
    case 'radial':
    case 'conic':
      return `<radialGradient id="${id}" cx="50%" cy="50%" r="70%">${stops}</radialGradient>`;
    default:
      return '';
  }
}

/**
 * Export QR matrix as true vector SVG with full styling support
 * Creates resolution-independent vector paths for each module
 */
export function exportVectorSvg(matrix: boolean[][], config: VectorSvgConfig = {}): ExportResult {
  const moduleCount = matrix.length;
  const moduleSize = config.moduleSize ?? 10;
  const margin = config.margin ?? 4;
  const fgColor = config.fgColor ?? '#000000';
  const bgColor = config.bgColor ?? '#ffffff';
  const filename = config.filename ?? 'anqr-qrcode';
  const moduleStyle = config.moduleStyle ?? 'square';
  const cornerRadius = config.cornerRadius ?? 0;
  const finderStyle = config.finderStyle ?? 'square';
  const eyeOuterStyle = config.eyeOuterStyle ?? finderStyle;
  const eyeInnerStyle = config.eyeInnerStyle ?? finderStyle;
  const alignmentStyle = config.alignmentStyle ?? 'match_finder';
  const timingStyle = config.timingStyle ?? 'match_module';
  const gradient = config.gradient;

  // Calculate SVG dimensions
  const size = (moduleCount + margin * 2) * moduleSize;
  const marginPx = margin * moduleSize;

  // Determine fill color (may be gradient reference)
  const hasGradient =
    gradient && gradient.type !== 'none' && gradient.stops && gradient.stops.length > 0;
  const gradientId = 'qr-gradient';
  const fillColor = hasGradient ? `url(#${gradientId})` : fgColor;

  // Build SVG content
  let defs = '';
  if (hasGradient && gradient) {
    defs = `<defs>${generateGradientDef(gradient, gradientId)}</defs>`;
  }

  // Generate finder patterns separately for proper styling
  let finderPaths = '';
  const finderPositions = [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: moduleCount - 7 }, // Top-right
    { row: moduleCount - 7, col: 0 }, // Bottom-left
  ];

  for (const pos of finderPositions) {
    const x = marginPx + pos.col * moduleSize;
    const y = marginPx + pos.row * moduleSize;
    finderPaths += generateFinderSvg(x, y, moduleSize, eyeOuterStyle, eyeInnerStyle, fillColor);
  }

  // Generate alignment patterns (for version 2+ QR codes)
  let alignmentPaths = '';
  const alignmentPositions = getAlignmentPositions(moduleCount);
  for (const pos of alignmentPositions) {
    const centerX = marginPx + pos.col * moduleSize + moduleSize / 2;
    const centerY = marginPx + pos.row * moduleSize + moduleSize / 2;
    alignmentPaths += generateAlignmentSvg(
      centerX,
      centerY,
      moduleSize,
      alignmentStyle,
      finderStyle,
      fillColor
    );
  }

  // Generate timing patterns (row 6 and column 6)
  let timingPathData = '';
  // Horizontal timing pattern (row 6, cols 8 to moduleCount-8)
  for (let col = 8; col < moduleCount - 8; col++) {
    if (matrix[6][col]) {
      const x = marginPx + col * moduleSize;
      const y = marginPx + 6 * moduleSize;
      timingPathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }
  // Vertical timing pattern (col 6, rows 8 to moduleCount-8)
  for (let row = 8; row < moduleCount - 8; row++) {
    if (matrix[row][6]) {
      const x = marginPx + 6 * moduleSize;
      const y = marginPx + row * moduleSize;
      timingPathData += `${generateTimingModulePath(x, y, moduleSize, timingStyle, moduleStyle, cornerRadius)} `;
    }
  }

  // Build path for data modules (excluding finder, alignment, and timing patterns)
  let dataPathData = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip finder pattern areas (handled separately)
      if (isFinderPattern(row, col, moduleCount)) continue;
      // Skip alignment pattern areas (handled separately)
      if (isAlignmentPattern(row, col, moduleCount)) continue;
      // Skip timing pattern areas (handled separately)
      if (isTimingPattern(row, col, moduleCount)) continue;

      if (matrix[row][col]) {
        const x = marginPx + col * moduleSize;
        const y = marginPx + row * moduleSize;
        dataPathData += `${generateModulePath(x, y, moduleSize, moduleStyle, cornerRadius)} `;
      }
    }
  }

  // Build metadata elements
  let metadataContent = '';
  if (config.metadata) {
    const m = config.metadata;
    if (m.title) {
      metadataContent += `  <title>${escapeXml(m.title)}</title>\n`;
    }
    if (m.description) {
      metadataContent += `  <desc>${escapeXml(m.description)}</desc>\n`;
    }
    // Build Dublin Core / RDF metadata block for author, copyright, etc.
    const dcElements: string[] = [];
    if (m.author) {
      dcElements.push(`        <dc:creator>${escapeXml(m.author)}</dc:creator>`);
    }
    if (m.copyright) {
      dcElements.push(`        <dc:rights>${escapeXml(m.copyright)}</dc:rights>`);
    }
    if (m.creationTime) {
      dcElements.push(`        <dc:date>${new Date().toISOString()}</dc:date>`);
    }
    if (m.software) {
      dcElements.push(`        <dc:source>${escapeXml(m.software)}</dc:source>`);
    }
    if (dcElements.length > 0) {
      metadataContent += `  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
${dcElements.join('\n')}
      </rdf:Description>
    </rdf:RDF>
  </metadata>\n`;
    }
  }

  // Create SVG content
  // Use shape-rendering="crispEdges" to prevent anti-aliasing gaps between adjacent modules
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
${metadataContent}  ${defs}
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${finderPaths}
  ${alignmentPaths}
  <path d="${timingPathData.trim()}" fill="${fillColor}"/>
  <path d="${dataPathData.trim()}" fill="${fillColor}"/>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: `${filename}.svg`,
    format: 'svg',
    width: size,
    height: size,
  };
}

/**
 * Download canvas as SVG
 */
export async function downloadSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {}
): Promise<void> {
  const result = await exportSvg(canvas, config);
  downloadUrl(result.url, result.filename, result.blob);
  // Don't revoke URL immediately on native - file save is async
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}

/**
 * Download QR matrix as true vector SVG with full styling support
 */
export function downloadVectorSvg(matrix: boolean[][], config: VectorSvgConfig = {}): void {
  const result = exportVectorSvg(matrix, config);
  downloadUrl(result.url, result.filename, result.blob);
  // Don't revoke URL immediately on native - file save is async
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Save file on native platform (Android/iOS) using MediaStore API
 * This works with Android scoped storage (Android 10+)
 */
async function saveFileNative(filename: string, blob: Blob): Promise<boolean> {
  try {
    // Convert blob to base64 data URL
    const base64DataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Determine mime type from blob
    const mimeType = blob.type || 'application/octet-stream';

    // Write to Documents directory via MediaStore
    const result = await saveBase64ToDocuments({
      filename,
      base64: base64DataUrl,
      mimeType,
      subdir: 'ANQR',
    });

    console.log('File saved:', result);

    // Show a simple alert to confirm save
    alert(`Saved to Documents/ANQR: ${filename}`);

    return true;
  } catch (error) {
    console.error('Failed to save file on native platform:', error);
    alert(`Failed to save file: ${error}`);
    return false;
  }
}

/**
 * Download from URL (web) or save file (native)
 */
export function downloadUrl(url: string, filename: string, blob?: Blob): void {
  // On native platforms, use Filesystem API
  if (Capacitor.isNativePlatform() && blob) {
    saveFileNative(filename, blob); // Fire and forget
  } else {
    // On web, use standard download approach
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Convert canvas to blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = 'image/png',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
      format,
      quality
    );
  });
}

// ============================================
// LEGACY CLASS EXPORT (for backwards compatibility)
// ============================================

export class Exporter {
  async downloadImage(canvas: HTMLCanvasElement, config: Partial<ExportConfig>): Promise<void> {
    return downloadImage(canvas, config);
  }

  async downloadGif(frames: HTMLCanvasElement[], config: Partial<ExportConfig>): Promise<void> {
    return downloadGif(frames, config);
  }

  async downloadSvg(canvas: HTMLCanvasElement, config: Partial<ExportConfig>): Promise<void> {
    return downloadSvg(canvas, config);
  }

  downloadUrl(url: string, filename: string): void {
    downloadUrl(url, filename);
  }
}

// ============================================
// EXPORT
// ============================================

export const ExporterModule = {
  // Image export
  exportImage,
  downloadImage,

  // GIF export
  exportGif,
  downloadGif,

  // SVG export
  exportSvg,
  exportVectorSvg,
  downloadSvg,
  downloadVectorSvg,

  // Utilities
  downloadUrl,
  canvasToBlob,

  // Legacy class
  Exporter,
};

export default ExporterModule;
