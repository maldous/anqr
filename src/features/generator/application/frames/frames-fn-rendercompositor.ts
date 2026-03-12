/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render frame using GIF compositor.
 */

import type { GifCompositor } from '@/modules/animation';
import { applyTemporalNoiseToCanvas, calculateTemporalOffset, type TemporalDitherMode } from '@/domain/render/dither/temporal';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { qrGenerator } from '@/features/generator/application/generation/generation-singleton';


export async function renderFrameWithCompositor(params: {
  gifCompositor: GifCompositor;
  effectiveFrameIndices: number[];
  frameIdx: number;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  getTemporalScratch: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  previewScanConfigBase: QRGeneratorConfig;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const actualFrameIdx = params.effectiveFrameIndices[params.frameIdx];
  const prevActualFrameIdx =
    params.frameIdx > 0 ? params.effectiveFrameIndices[params.frameIdx - 1] : -1;
  for (let i = prevActualFrameIdx + 1; i <= actualFrameIdx; i++) {
    if (i > 0) params.gifCompositor.dispose(i - 1);
    params.gifCompositor.apply(i);
  }
  const processedOverlay = params.applyGeometricTransforms(params.gifCompositor.canvas);
  let overlayToUse: HTMLCanvasElement | OffscreenCanvas = processedOverlay;
  if (params.useTemporalDither) {
    const temporalOffset = calculateTemporalOffset(
      params.frameIdx,
      params.temporalMode,
      params.animationSeed
    );
    overlayToUse = applyTemporalNoiseToCanvas(
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
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return params.isArtworkMode
    ? await params.generateArtworkFrame(overlayToUse, params.frameIdx)
    : await qrGenerator.generate(frameConfig, overlayToUse);
}

