import { PngMetadata } from "./png-metadata.types";
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
      creationTime: "Creation Time",
      software: "Software",
    };

    for (const [key, value] of Object.entries(metadata)) {
      if (value && typeof value === "string") {
        const keyword = keywordMap[key] || key;
        chunks.push(createPngTextChunk(keyword, value));
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
