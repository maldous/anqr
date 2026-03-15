import { createPngChunk } from './create-png-chunk';

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

  return createPngChunk('pHYs', chunkData);
}
