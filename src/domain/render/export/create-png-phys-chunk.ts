import { calculateCrc32 } from './calculate-crc32';

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
