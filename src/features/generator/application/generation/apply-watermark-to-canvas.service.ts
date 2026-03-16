/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply watermark overlay to generated canvas.
 */

import { applyWatermark, type WatermarkPosition } from "@/domain/render/overlay/watermark";
import { loadFileAsCanvas } from "@/features/generator/application/input/load-file-as-canvas.service";

export async function applyWatermarkToCanvas<
  T extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  watermarkConfig: T,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (!watermarkConfig.enabled) return sourceCanvas;
  let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;
  if (
    (watermarkConfig.kind === "image" || watermarkConfig.kind === "pattern") &&
    watermarkConfig.image
  ) {
    watermarkImage = await loadFileAsCanvas(watermarkConfig.image);
  }
  const watermarked = applyWatermark(
    sourceCanvas as HTMLCanvasElement,
    {
      kind: watermarkConfig.kind,
      text: watermarkConfig.text,
      image: watermarkImage ?? undefined,
      position: watermarkConfig.position as WatermarkPosition,
      opacity: watermarkConfig.opacity,
      blend: watermarkConfig.blend,
    } as Parameters<typeof applyWatermark>[1],
  );
  return watermarked.canvas;
}
