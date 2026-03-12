/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Process and post-process a single animation frame.
 */

import type { GifCompositor } from '@/modules/animation';
import type { TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { processAnimationFrameLoopIteration } from '@/features/generator/application/frames/frames-fn-loopiter';
import { applyFramePostProcessing } from '@/features/generator/application/frames/frames-fn-postprocess';
import { createScratchCanvasPool } from '@/features/generator/application/frames/frames-fn-scratchpool';
import { PatternEffect } from '@/features/generator/application/frames/frames-type-patterneffect';
import { drawToDisplayCanvas } from '@/features/generator/application/generation/generation-fn-drawtodisplay';


export async function processAndPostProcessFrame<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
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
    i: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, total: number) => number;
  moduleJitterPx: number;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
  isRunCancelled: () => boolean;
  persistFrameCanvas: (c: HTMLCanvasElement | OffscreenCanvas) => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getLatestFrame: () => HTMLCanvasElement | OffscreenCanvas | undefined;
}): Promise<void> {
  const result = await processAnimationFrameLoopIteration({
    frameIdx: params.frameIdx,
    frame: params.frame,
    framesToProcessLength: params.framesToProcessLength,
    shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
    hasPattern: params.hasPattern,
    hasJitter: params.hasJitter,
    previewScanConfigBase: params.previewScanConfigBase,
    useTemporalDither: params.useTemporalDither,
    temporalMode: params.temporalMode,
    animationSeed: params.animationSeed,
    useCompositor: params.useCompositor,
    gifCompositor: params.gifCompositor,
    effectiveFrameIndices: params.effectiveFrameIndices,
    applyGeometricTransforms: params.applyGeometricTransforms,
    scratchPool: params.scratchPool,
    isArtworkMode: params.isArtworkMode,
    generateArtworkFrame: params.generateArtworkFrame,
    modulePatternEffects: params.modulePatternEffects,
    applyModulePatternEphemeral: params.applyModulePatternEphemeral,
    computeJitter: params.computeJitter,
    moduleJitterPx: params.moduleJitterPx,
  });

  if (params.isRunCancelled()) return;

  if (result) {
    const previewFrame = await applyFramePostProcessing({
      result,
      shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
      resultPatternEffects: params.resultPatternEffects,
      applyResultEphemeral: params.applyResultEphemeral,
      frameIdx: params.frameIdx,
      framesToProcessLength: params.framesToProcessLength,
      hasColorCycle: params.hasColorCycle,
      watermarkConfig: params.watermarkConfig,
      watermarkImage: params.watermarkImage,
    });

    params.persistFrameCanvas(previewFrame);
    if (params.isRunCancelled()) return;

    const latestStoredFrame = params.getLatestFrame() ?? previewFrame;
    params.setCanvas(latestStoredFrame);
    if (params.canvasRef.current) {
      drawToDisplayCanvas(params.canvasRef.current, latestStoredFrame);
    }
  }
}

