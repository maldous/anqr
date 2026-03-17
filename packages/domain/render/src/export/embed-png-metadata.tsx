import type { PngMetadata } from "@/modules/exporter/png-metadata.types";
import { log } from "./log";
import { createPngTextChunk } from "./create-png-text-chunk";

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
      log.warn("Invalid PNG signature, returning original");
      return pngBlob;
    }
  }

  // Create metadata chunks
  const metadataChunks: Uint8Array[] = [];

  // Standard PNG text keywords
  const keywordMap: Record<string, string> = {
    title: "Title",
    author: "Author",
    description: "Description",
    copyright: "Copyright",
    creationTime: "Creation Time",
    software: "Software",
    comment: "Comment",
  };

  for (const entry of Object.entries(metadata)) {
    const [key, value] = entry;
    if (value && typeof value === "string") {
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
    log.warn("Could not find IEND chunk, returning original");
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

  return new Blob([newPng], { type: "image/png" });
}
