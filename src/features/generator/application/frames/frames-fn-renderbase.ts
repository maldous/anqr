/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render single frame for base animation.
 */

import { calculateTemporalOffset, type TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { qrGenerator } from '@/features/generator/application/generation/generation-singleton';


export async function renderFrameForBaseAnimation(params: {
  hasPattern: boolean;
  hasJitter: boolean;
  frame: AnimationFrame;
  frameIdx: number;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (params.hasPattern || params.hasJitter) {
    return params.frame.canvas;
  }
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return await qrGenerator.generate(frameConfig, null);
}

