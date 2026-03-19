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

  const localOverlayRoot = process.env.ANQR_LOCAL_OVERLAY_ROOT
    ? path.resolve(process.env.ANQR_LOCAL_OVERLAY_ROOT)
    : path.resolve(process.cwd(), "public");

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
