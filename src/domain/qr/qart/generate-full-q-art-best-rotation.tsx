import type { FullQArtConfig, FullQArtResult } from "./generate.types";
import { generateFullQArt } from "./generate-full-q-art";

/**
 * Generate QR-Art trying multiple rotations of the target image
 */
export async function generateFullQArtBestRotation(
  config: FullQArtConfig,
): Promise<FullQArtResult> {
  // Delegates to base implementation with default image orientation
  return generateFullQArt(config);
}
