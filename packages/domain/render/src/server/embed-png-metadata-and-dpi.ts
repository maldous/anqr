import type { PngMetadata } from "./png-metadata.types";
import { createPngPhysChunk } from "./create-png-phys-chunk";
import { createPngTextChunk } from "./create-png-text-chunk";

export function embedPngMetadataAndDpi(
  pngBuffer: Buffer,
  metadata?: PngMetadata,
  dpi?: number,
): Buffer {
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
      title: "Title",
      author: "Author",
      description: "Description",
      copyright: "Copyright",
      license: "License",
      creationTime: "Creation Time",
      software: "Software",
    };

    for (const [key, value] of Object.entries(metadata)) {
      if (key === "custom") continue; // handled separately below
      if (value && typeof value === "string") {
        const keyword = keywordMap[key] || key;
        chunks.push(createPngTextChunk(keyword, value));
      }
    }
    // B14: custom k/v pairs from user metadata. PNG iTXt keywords must
    // be 1-79 ASCII printable chars and may not start/end with a space.
    // Sanitise + skip invalid entries; the chunk creator already
    // UTF-8-encodes the value text.
    if (Array.isArray(metadata.custom)) {
      for (const { k, v } of metadata.custom) {
        const keyword = k
          .trim()
          .replace(/[^\x20-\x7e]/g, "")
          .slice(0, 79);
        if (keyword && v) {
          chunks.push(createPngTextChunk(keyword, v));
        }
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
