import type { TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { AnimationFrame, GifCompositor } from '@/modules/animation';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import type { createScratchCanvasPool } from './frames-fn-scratchpool';
import type { PatternEffect } from './frames-type-patterneffect';

export interface FrameRenderContext {
  animationSeed: number;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, total: number) => number;
  effectiveFrameIndices: number[];
  frame: AnimationFrame;
  frameIdx: number;
  framesToProcessLength: number;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    i: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  gifCompositor: GifCompositor | null;
  hasJitter: boolean;
  hasPattern: boolean;
  isArtworkMode: boolean;
  moduleJitterPx: number;
  modulePatternEffects: PatternEffect[];
  previewScanConfigBase: QRGeneratorConfig;
  scratchPool: ReturnType<typeof createScratchCanvasPool>;
  shouldGenerateBaseAnimation: boolean;
  temporalMode: TemporalDitherMode;
  useCompositor: boolean;
  useTemporalDither: boolean;
}
