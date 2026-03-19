import fs from "node:fs/promises";
import type { FetchedImage } from "./fetched-image.types";
import { decodeOverlayBuffer } from "./decode-overlay-buffer";
import { resolveValidatedLocalOverlayPath } from "./resolve-validated-local-overlay-path";

export async function readLocalOverlayFile(fileUrl: URL): Promise<FetchedImage | null> {
  if (!process.env.NETLIFY_DEV) {
    return null;
  }

  const overlayPath = await resolveValidatedLocalOverlayPath(fileUrl);
  if (!overlayPath) {
    return null;
  }

  try {
    const buffer = await fs.readFile(overlayPath);
    return decodeOverlayBuffer(buffer);
  } catch {
    return null;
  }
}
