import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "../../../src/modules/qr-generator";

export async function renderQRFrameWithFallback(
  overlayInput: Canvas,
  frameIdx: number,
  isArtworkMode: boolean,
  generateArtworkFn: ((canvas: Canvas, idx: number) => Promise<Canvas>) | null,
  qrGenerator: QRGenerator,
  frameConfig: Record<string, unknown>,
): Promise<Canvas> {
  if (isArtworkMode && generateArtworkFn) {
    try {
      return await generateArtworkFn(overlayInput, frameIdx);
    } catch {
      /* (error_) {
      console.warn('[ARTWORK] frame render fallback', {
        frame: frameIdx,
        error: error_ instanceof Error ? error_.message : String(error_),
      });
      */
      return await qrGenerator.generate(frameConfig, overlayInput);
    }
  }
  return await qrGenerator.generate(frameConfig, overlayInput);
}
