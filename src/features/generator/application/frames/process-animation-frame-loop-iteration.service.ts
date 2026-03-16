/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Process one iteration of animation frame loop.
 */

import { renderFrameForBaseAnimation } from "@/features/generator/application/frames/render-frame-for-base-animation.service";
import { renderFrameWithCompositor } from "@/features/generator/application/frames/render-frame-with-compositor.service";
import { renderFrameWithLegacyPath } from "@/features/generator/application/frames/render-frame-with-legacy-path.service";
import type { FrameRenderContext } from "./frame-render-context.types";

export async function processAnimationFrameLoopIteration(
  params: FrameRenderContext,
): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
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
