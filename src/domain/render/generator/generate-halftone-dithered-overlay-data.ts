import type {
  CreateCanvasFn,
  OverlayData,
  QRCodeInstance,
  QRGeneratorConfig,
} from "../../../modules/qr-generator/types";
import { generateDitheredMatrix } from "./generate-dithered-matrix";
import { aggregateModuleHalftoneData } from "./aggregate-module-halftone-data";
import { clamp01 } from "./clamp01";
import { log } from "./log";

/**
 * Generate halftone-dithered overlay data.
 * Runs error diffusion at sub-pixel level (scale=4), then aggregates per-module
 * dark-pixel density and average overlay color into module-level OverlayData.
 * The density drives halftone dot sizing in the render loop.
 */
export async function generateHalftoneDitheredOverlayData(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void,
): Promise<{ overlayData: OverlayData; effectiveIntensity: number }> {
  const scale = 4;

  const ditheredResult = await generateDitheredMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    scale,
    effectiveIntensity,
    effectiveConfig,
    createCanvasFn,
    releaseCanvasFn,
  );

  // Also sample the original overlay at module resolution so halftone dot sizing
  // preserves the actual image luminance instead of only QR-constrained density.
  const moduleCanvas = await createCanvasFn(moduleCount, moduleCount);
  const moduleCtx = moduleCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;
  let moduleData: Uint8ClampedArray | null = null;
  if (moduleCtx) {
    moduleCtx.imageSmoothingEnabled = true;
    moduleCtx.imageSmoothingQuality = "high";
    moduleCtx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);
    moduleData = moduleCtx.getImageData(0, 0, moduleCount, moduleCount).data;
  }
  if (releaseCanvasFn) releaseCanvasFn(moduleCanvas);

  const overlayBrightness = new Float32Array(moduleCount * moduleCount);
  const overlayColorsPacked = new Uint32Array(moduleCount * moduleCount);
  // scale * scale — computed inline where needed
  // 0 => pure original overlay luminance, 1 => pure dither density.
  // Keep original image dominant so backdrop remains clearly visible.
  const densityInfluence = clamp01(0.15 + effectiveIntensity * 0.15);

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      aggregateModuleHalftoneData(
        ditheredResult,
        moduleData,
        mr,
        mc,
        scale,
        moduleCount,
        effectiveIntensity,
        densityInfluence,
        overlayBrightness,
        overlayColorsPacked,
      );
    }
  }

  log.debug("halftone-dithered overlay data generated", {
    moduleCount,
    scale,
    effectiveIntensity,
  });

  return {
    overlayData: {
      size: moduleCount,
      brightness: overlayBrightness,
      colorsPacked: overlayColorsPacked,
    } as OverlayData,
    effectiveIntensity,
  };
}
