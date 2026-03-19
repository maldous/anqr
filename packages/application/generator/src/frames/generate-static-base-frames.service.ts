/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Generate static base frames for animation.
 */

import type { AnimationFrame } from "@/domain/render/animation";
import type { QRGeneratorConfig } from "@/domain/qr/generator";
import { qrGenerator } from "../generation/generation-singleton";

export async function generateStaticBaseFrames(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
}): Promise<AnimationFrame[] | null> {
  const staticBaseQR = await qrGenerator.generate(params.previewScanConfigBase, null);
  if (!staticBaseQR || params.isRunCancelled()) return null;
  return Array.from({ length: params.frameCount }, () => ({
    canvas: staticBaseQR,
    delay: params.speedMs,
    disposalType: 0,
  }));
}
