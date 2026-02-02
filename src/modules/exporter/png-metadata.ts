/**
 * Exporter Module - PNG Metadata
 * Functions for embedding metadata and DPI into PNG files
 */

import { createLogger } from '../../lib/logger';
import type { PngMetadata } from './types';

const log = createLogger('EXPORT');

/**
 * CRC32 calculation for PNG chunks
 */
export function calculateCrc32(data: Uint8Array): number {
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
 * Create PNG pHYs chunk for DPI embedding
 */
export function createPngPhysChunk(dpi: number): Uint8Array {
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
export async function embedPngDpi(pngBlob: Blob, dpi: number): Promise<Blob> {
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

/**
 * Create a PNG iTXt chunk for metadata embedding (UTF-8 safe)
 */
export function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  // iTXt chunk structure:
  // keyword (1-79 bytes) + null + compression flag (1 byte) + compression method (1 byte)
  // + language tag + null + translated keyword + null + text
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
 * Embed metadata into PNG blob
 */
export async function embedPngMetadata(pngBlob: Blob, metadata: PngMetadata): Promise<Blob> {
  const arrayBuffer = await pngBlob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Verify PNG signature
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (const [i, sigByte] of pngSignature.entries()) {
    if (data[i] !== sigByte) {
      log.warn('Invalid PNG signature, returning original');
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
    log.warn('Could not find IEND chunk, returning original');
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
