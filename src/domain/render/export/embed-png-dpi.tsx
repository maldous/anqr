import { createPngPhysChunk } from './create-png-phys-chunk';

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
