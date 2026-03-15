/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render frame via legacy rendering path.
 */

import { type TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { PatternEffect } from '@/features/generator/application/frames/frames-type-patterneffect';
import { applyFrameTemporalNoise } from './apply-frame-temporal-noise';
import { renderGeneratedFrame } from './render-generated-frame';

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
  let temporalOffset = 0;
  if (params.useTemporalDither) {
    ({ frame: processedOverlay, temporalOffset } = applyFrameTemporalNoise({
      animationSeed: params.animationSeed,
      frame: processedOverlay,
      frameIdx: params.frameIdx,
      getTemporalScratch: params.getTemporalScratch,
      temporalMode: params.temporalMode,
    }));
  }
  return renderGeneratedFrame({
    frame: processedOverlay,
    frameIdx: params.frameIdx,
    generateArtworkFrame: params.generateArtworkFrame,
    isArtworkMode: params.isArtworkMode,
    moduleJitterPx: params.hasJitter
      ? params.computeJitter(params.frameIdx, params.framesToProcessLength)
      : params.moduleJitterPx,
    previewScanConfigBase: params.previewScanConfigBase,
    temporalOffset,
  });
}
