import type { AnimationFrame } from "./types";
import { parseBlobAsSingleFrame } from "./parse-blob-as-single-frame";

/**
 * Parse any static image as a single animation frame
 */
export async function parseStaticImageAsFrame(source: ArrayBuffer): Promise<AnimationFrame[]> {
  return parseBlobAsSingleFrame(new Blob([source]), "Failed to load image");
}
