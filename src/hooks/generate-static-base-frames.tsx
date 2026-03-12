import type { AnimationFrame } from '../domain/render/animation';
import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';

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
