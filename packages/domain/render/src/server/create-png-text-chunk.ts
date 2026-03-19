import { createPngChunk } from "../export/create-png-chunk";

export function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  chunkData.set(keywordBytes, 0);
  chunkData.set([0], keywordBytes.length);
  chunkData.set(textBytes, keywordBytes.length + 1);
  return createPngChunk("tEXt", chunkData);
}
