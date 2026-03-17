import { createPngChunk } from "./create-png-chunk";

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

  return createPngChunk("iTXt", chunkData);
}
