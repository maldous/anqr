/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Process one iteration of animation frame loop.
 */

import type { GifCompositor } from '@/modules/animation';
import type { TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { renderFrameForBaseAnimation } from '@/features/generator/application/frames/frames-fn-renderbase';
import { renderFrameWithCompositor } from '@/features/generator/application/frames/frames-fn-rendercompositor';
import { renderFrameWithLegacyPath } from '@/features/generator/application/frames/frames-fn-renderlegacy';
import { createScratchCanvasPool } from '@/features/generator/application/frames/frames-fn-scratchpool';
import { PatternEffect } from '@/features/generator/application/frames/frames-type-patterneffect';

export async function processAnimationFrameLoopIteration(params: {
  frameIdx: number;
  frame: AnimationFrame;
  framesToProcessLength: number;
  shouldGenerateBaseAnimation: boolean;
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  useCompositor: boolean;
  gifCompositor: GifCompositor | null;
  effectiveFrameIndices: number[];
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  scratchPool: ReturnType<typeof createScratchCanvasPool>;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, tf: number) => number;
  moduleJitterPx: number;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (params.shouldGenerateBaseAnimation) {
    return await renderFrameForBaseAnimation({
      hasPattern: params.hasPattern,
      hasJitter: params.hasJitter,
      frame: params.frame,
      frameIdx: params.frameIdx,
      previewScanConfigBase: params.previewScanConfigBase,
      useTemporalDither: params.useTemporalDither,
      temporalMode: params.temporalMode,
      animationSeed: params.animationSeed,
    });
  }
  if (params.useCompositor && params.gifCompositor) {
    return await renderFrameWithCompositor({
      gifCompositor: params.gifCompositor,
      effectiveFrameIndices: params.effectiveFrameIndices,
      frameIdx: params.frameIdx,
      applyGeometricTransforms: params.applyGeometricTransforms,
      useTemporalDither: params.useTemporalDither,
      temporalMode: params.temporalMode,
      animationSeed: params.animationSeed,
      getTemporalScratch: params.scratchPool.getTemporalScratch,
      previewScanConfigBase: params.previewScanConfigBase,
      isArtworkMode: params.isArtworkMode,
      generateArtworkFrame: params.generateArtworkFrame,
    });
  }
  return await renderFrameWithLegacyPath({
    frame: params.frame,
    frameIdx: params.frameIdx,
    framesToProcessLength: params.framesToProcessLength,
    applyGeometricTransforms: params.applyGeometricTransforms,
    modulePatternEffects: params.modulePatternEffects,
    applyModulePatternEphemeral: params.applyModulePatternEphemeral,
    useTemporalDither: params.useTemporalDither,
    temporalMode: params.temporalMode,
    animationSeed: params.animationSeed,
    getTemporalScratch: params.scratchPool.getTemporalScratch,
    hasJitter: params.hasJitter,
    computeJitter: params.computeJitter,
    moduleJitterPx: params.moduleJitterPx,
    previewScanConfigBase: params.previewScanConfigBase,
    isArtworkMode: params.isArtworkMode,
    generateArtworkFrame: params.generateArtworkFrame,
  });
}
