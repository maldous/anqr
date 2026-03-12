import type { AnimationFrame } from '../domain/render/animation';
import { calculateTemporalOffset, type TemporalDitherMode } from '../domain/render/dither';
import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';

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
