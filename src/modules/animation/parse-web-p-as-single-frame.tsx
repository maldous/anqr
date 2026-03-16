import type { AnimationFrame } from "./types";
import { parseBlobAsSingleFrame } from "./parse-blob-as-single-frame";

/**
 * Parse WebP as a single frame (fallback)
 */
export async function parseWebPAsSingleFrame(source: ArrayBuffer): Promise<AnimationFrame[]> {
  return parseBlobAsSingleFrame(
    new Blob([source], { type: "image/webp" }),
    "Failed to load WebP image",
  );
}
