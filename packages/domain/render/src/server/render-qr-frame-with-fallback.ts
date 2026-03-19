import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "@/modules/qr-generator";
import type { AnyCanvas, QRGeneratorConfig } from "@/modules/qr-generator";

export async function renderQRFrameWithFallback(
  overlayInput: Canvas,
  frameIdx: number,
  isArtworkMode: boolean,
  generateArtworkFn: ((canvas: Canvas, idx: number, normalize: boolean) => Promise<Canvas>) | null,
  qrGenerator: QRGenerator,
  frameConfig: Record<string, unknown>,
): Promise<Canvas> {
  if (isArtworkMode && generateArtworkFn) {
    try {
      return await generateArtworkFn(overlayInput, frameIdx, true);
    } catch {
      /* (error_) {
      console.warn('[ARTWORK] frame render fallback', {
        frame: frameIdx,
        error: error_ instanceof Error ? error_.message : String(error_),
      });
      */
      return (await qrGenerator.generate(
        frameConfig as unknown as QRGeneratorConfig,
        overlayInput as unknown as AnyCanvas,
      )) as unknown as Canvas;
    }
  }
  return (await qrGenerator.generate(
    frameConfig as unknown as QRGeneratorConfig,
    overlayInput as unknown as AnyCanvas,
  )) as unknown as Canvas;
}
