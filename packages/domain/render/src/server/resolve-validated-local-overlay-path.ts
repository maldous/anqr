import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isPathWithinRoot } from "./is-path-within-root";

export async function resolveValidatedLocalOverlayPath(fileUrl: URL): Promise<string | null> {
  if (fileUrl.protocol !== "file:") {
    return null;
  }

  let overlayPath: string;
  try {
    overlayPath = fileURLToPath(fileUrl);
  } catch {
    return null;
  }

  // Local file:// overlays are a dev-only convenience. In production
  // (Netlify functions), no env var is set and we return early — this
  // ALSO prevents the Netlify NFT bundler from tracing process.cwd() +
  // "public" and bundling all 81 MB of public/ assets into every function
  // zip. See docs/review-2026-05-24.md C-F1.
  const overlayRoot = process.env.ANQR_LOCAL_OVERLAY_ROOT;
  if (!overlayRoot) {
    return null;
  }
  const localOverlayRoot = path.resolve(overlayRoot);

  if (!isPathWithinRoot(overlayPath, localOverlayRoot)) {
    return null;
  }

  try {
    const stats = await fs.stat(overlayPath);
    return stats.isFile() ? overlayPath : null;
  } catch {
    return null;
  }
}
