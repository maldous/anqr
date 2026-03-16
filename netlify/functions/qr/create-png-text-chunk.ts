import { calculateCrc32 } from "./calculate-crc32";

export function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  chunkData.set(keywordBytes, 0);
  chunkData.set([0], keywordBytes.length);
  chunkData.set(textBytes, keywordBytes.length + 1);

  const chunkType = new TextEncoder().encode("tEXt");
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
