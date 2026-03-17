/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Generate pattern-only animation frames.
 */

import type { AnimationFrame } from "@/modules/animation";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { qrGenerator } from "../generation/generation-singleton";

export async function generatePatternOnlyFrames(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number,
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<AnimationFrame[] | null> {
  const baseQR = await qrGenerator.generate(params.previewScanConfigBase, null);
  if (!baseQR || params.isRunCancelled()) return null;
  return Array.from({ length: params.frameCount }, (_, i) => ({
    canvas: params.applyResultPersistent(baseQR, i, params.frameCount),
    delay: params.speedMs,
    disposalType: 0,
  }));
}
