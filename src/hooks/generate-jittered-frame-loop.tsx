import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';
import { YieldController } from './yield-controller';

export async function generateJitteredFrameLoop(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (frameIndex: number, totalFrames: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<(HTMLCanvasElement | OffscreenCanvas)[] | null> {
  const collected: (HTMLCanvasElement | OffscreenCanvas)[] = [];
  for (let i = 0; i < params.frameCount; i++) {
    if (params.isRunCancelled()) return null;
    if (await params.yieldCtrl.yieldIfNeeded()) {
      if (params.isRunCancelled()) return null;
    }
    const frameConfig = {
      ...params.previewScanConfigBase,
      frameIndex: i,
      moduleJitterPx: params.computeJitter(i, params.frameCount),
    };
    const qrFrame = await qrGenerator.generate(frameConfig, null);
    if (qrFrame) {
      collected.push(params.applyResultPersistent(qrFrame, i, params.frameCount));
    }
  }
  return collected;
}
