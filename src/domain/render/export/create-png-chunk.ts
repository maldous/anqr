import { calculateCrc32 } from './calculate-crc32';

export function createPngChunk(type: string, chunkData: Uint8Array): Uint8Array {
  const chunkType = new TextEncoder().encode(type);
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  const dataView = new DataView(chunk.buffer);

  dataView.setUint32(0, chunkData.length, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);

  const crcData = new Uint8Array(4 + chunkData.length);
  crcData.set(chunkType, 0);
  crcData.set(chunkData, 4);
  dataView.setUint32(8 + chunkData.length, calculateCrc32(crcData), false);

  return chunk;
}
