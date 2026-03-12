/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Execute the main frame generation loop.
 */

import { createLogger } from '@/infra/logging/logger';
import type { GifCompositor } from '@/modules/animation';
import type { TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame } from '@/modules/animation';
import { canvasHashCache } from '@/modules/qr-generator/cache';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { processAndPostProcessFrame } from '@/features/generator/application/frames/frames-fn-processframe';
import { createScratchCanvasPool } from '@/features/generator/application/frames/frames-fn-scratchpool';
import { PatternEffect } from '@/features/generator/application/frames/frames-type-patterneffect';
import { YieldController } from '@/features/generator/application/generation/generation-class-yieldcontroller';

const log = createLogger('QR');


export async function executeFrameGenerationLoop<
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
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  framesToProcess: AnimationFrame[];
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  gifCompositor: GifCompositor | null;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  shouldGenerateBaseAnimation: boolean;
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  useCompositor: boolean;
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
  persistFrameCanvas: (c: HTMLCanvasElement | OffscreenCanvas) => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getLatestFrame: () => HTMLCanvasElement | OffscreenCanvas | undefined;
}): Promise<void> {
  for (let frameIdx = 0; frameIdx < params.framesToProcess.length; frameIdx++) {
    const frame = params.framesToProcess[frameIdx];
    params.updateGenerationProgress(
      params.t('preview.busy.renderingAnimationFrames', 'Rendering the animation frames...'),
      10 + ((frameIdx + 1) / Math.max(1, params.framesToProcess.length)) * 78
    );
    if (params.isRunCancelled()) return;

    if (params.gifCompositor?.canvas instanceof HTMLCanvasElement) {
      canvasHashCache.delete(params.gifCompositor.canvas);
    }

    if (await params.yieldCtrl.yieldIfNeeded()) {
      if (params.isRunCancelled()) return;
    }

    try {
      await processAndPostProcessFrame({
        frameIdx,
        frame,
        framesToProcessLength: params.framesToProcess.length,
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
        resultPatternEffects: params.resultPatternEffects,
        applyResultEphemeral: params.applyResultEphemeral,
        hasColorCycle: params.hasColorCycle,
        watermarkConfig: params.watermarkConfig,
        watermarkImage: params.watermarkImage,
        isRunCancelled: params.isRunCancelled,
        persistFrameCanvas: params.persistFrameCanvas,
        setCanvas: params.setCanvas,
        canvasRef: params.canvasRef,
        getLatestFrame: params.getLatestFrame,
      });
    } catch (err) {
      log.error('Error generating frame', { error: err });
    }
  }
}

