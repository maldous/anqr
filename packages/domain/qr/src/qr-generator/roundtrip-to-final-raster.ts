import type { CanvasPool } from "@/platform/browser/canvas/canvas-factory";
import { resolveImageSource } from "./resolve-image-source";

export async function roundtripToFinalRaster(
  pool: CanvasPool,
  src: HTMLCanvasElement | OffscreenCanvas,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (
    typeof document === "undefined" ||
    typeof HTMLCanvasElement === "undefined" ||
    !(src instanceof HTMLCanvasElement) ||
    (typeof src.toBlob !== "function" && typeof src.toDataURL !== "function")
  ) {
    return src;
  }

  let out: HTMLCanvasElement | OffscreenCanvas | null = null;
  let bitmap: ImageBitmap | null = null;

  try {
    const resolved = await resolveImageSource(src);
    if (!resolved) {
      return src;
    }

    bitmap = resolved.bitmap;
    out = await pool.acquire(src.width, src.height);
    out.width = src.width;
    out.height = src.height;
    const outCtx = out.getContext("2d");
    if (!outCtx) {
      pool.release(out);
      return src;
    }

    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(resolved.source, 0, 0, out.width, out.height);
    if (bitmap && typeof bitmap.close === "function") {
      bitmap.close();
    }
    return out;
  } catch {
    if (out) {
      pool.release(out);
    }
    if (bitmap && typeof bitmap.close === "function") {
      bitmap.close();
    }
    return src;
  }
}
