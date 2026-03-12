import type { AnimationFrame } from '../domain/render/animation';
import { applyTemporalNoiseToCanvas, calculateTemporalOffset, type TemporalDitherMode } from '../domain/render/dither';
import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';
import type { PatternEffect } from './pattern-effect';

export async function renderFrameWithLegacyPath(params: {
  frame: AnimationFrame;
  frameIdx: number;
  framesToProcessLength: number;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  getTemporalScratch: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  hasJitter: boolean;
  computeJitter: (fi: number, tf: number) => number;
  moduleJitterPx: number;
  previewScanConfigBase: QRGeneratorConfig;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let processedOverlay: HTMLCanvasElement | OffscreenCanvas = params.applyGeometricTransforms(
    params.frame.canvas
  );
  if (params.modulePatternEffects.length > 0) {
    processedOverlay = params.applyModulePatternEphemeral(
      processedOverlay,
      params.frameIdx,
      params.framesToProcessLength
    );
  }
  if (params.useTemporalDither) {
    const temporalOffset = calculateTemporalOffset(
      params.frameIdx,
      params.temporalMode,
      params.animationSeed
    );
    processedOverlay = applyTemporalNoiseToCanvas(
      processedOverlay,
      temporalOffset,
      0.008,
      params.getTemporalScratch(
        (params.frameIdx % 2) as 0 | 1,
        processedOverlay.width,
        processedOverlay.height
      )
    );
  }
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    moduleJitterPx: params.hasJitter
      ? params.computeJitter(params.frameIdx, params.framesToProcessLength)
      : params.moduleJitterPx,
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return params.isArtworkMode
    ? await params.generateArtworkFrame(processedOverlay, params.frameIdx)
    : await qrGenerator.generate(frameConfig, processedOverlay);
}
