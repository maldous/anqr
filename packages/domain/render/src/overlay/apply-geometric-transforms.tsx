import type { CreateCanvasFn, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import { hasGeometricTransforms } from "./has-geometric-transforms";

/**
 * Apply geometric transforms to overlay canvas
 */
export async function applyGeometricTransforms(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // Return canvas as-is if no transforms needed
  if (!hasGeometricTransforms(config)) {
    return canvas;
  }

  // Create new canvas for transformed output
  const result = await createCanvasFn(canvas.width, canvas.height);
  const ctx = result.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) return canvas;

  ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  return result;
}
