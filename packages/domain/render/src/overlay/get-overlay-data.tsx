import { hashCanvasContent } from "./hash-canvas-content";
import { overlayDataCache } from "./overlay-data-cache";
import { packOverlayColor } from "./overlay-data-packed";
import type {
  CreateCanvasFn,
  OverlayData,
  QRGeneratorConfig,
} from "@/domain/render/qr-generator-shared";
import { rgbToLumaSrgb } from "./rgb-to-luma-srgb";

/**
 * Get overlay data (brightness and colors) from canvas
 */
export async function getOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn,
): Promise<OverlayData> {
  const emptyData: OverlayData = { size: 0, brightness: new Float32Array(0) } as OverlayData;
  if (!overlayCanvas) {
    return emptyData;
  }
  // Generate cache key
  const canvasHash = await hashCanvasContent(overlayCanvas, createCanvasFn);
  const cacheKey = `${canvasHash}:${moduleCount}:${config.overlayIntensity}:${config.colorMode}`;

  // Check cache
  const cached = overlayDataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Scale overlay to module count
  const scaledCanvas = await createCanvasFn(moduleCount, moduleCount);
  const ctx =
    scaledCanvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    }) ?? scaledCanvas.getContext("2d");
  if (!ctx) {
    return emptyData;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Cast to CanvasImageSource for drawImage compatibility with both HTMLCanvasElement and OffscreenCanvas
  ctx.drawImage(overlayCanvas as CanvasImageSource, 0, 0, moduleCount, moduleCount);

  const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);
  const data = imageData.data;

  const pixelCount = moduleCount * moduleCount;
  const brightness = new Float32Array(pixelCount);
  const includeColors = config.colorMode !== "bw";
  const colorsPacked = includeColors ? new Uint32Array(pixelCount) : undefined;
  for (let i = 0, src = 0; i < pixelCount; i++, src += 4) {
    const r = data[src];
    const g = data[src + 1];
    const b = data[src + 2];
    brightness[i] = rgbToLumaSrgb(r, g, b);
    if (colorsPacked) {
      colorsPacked[i] = packOverlayColor(r, g, b);
    }
  }

  const result: OverlayData = {
    size: moduleCount,
    brightness,
    colorsPacked,
  } as OverlayData;

  // Cache result
  overlayDataCache.set(cacheKey, result);

  return result;
}
