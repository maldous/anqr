import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "@/domain/qr/generator";
import type { AnyCanvas, QRGeneratorConfig } from "@/domain/qr/generator";

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
