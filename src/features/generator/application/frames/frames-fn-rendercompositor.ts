/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render frame using GIF compositor.
 */

import type { GifCompositor } from "@/modules/animation";
import { type TemporalDitherMode } from "@/domain/render/dither/temporal";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { applyFrameTemporalNoise } from "./apply-frame-temporal-noise";
import { renderGeneratedFrame } from "./render-generated-frame";

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
    fi: number,
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
  let temporalOffset = 0;
  if (params.useTemporalDither) {
    ({ frame: overlayToUse, temporalOffset } = applyFrameTemporalNoise({
      animationSeed: params.animationSeed,
      frame: processedOverlay,
      frameIdx: params.frameIdx,
      getTemporalScratch: params.getTemporalScratch,
      temporalMode: params.temporalMode,
    }));
  }
  return renderGeneratedFrame({
    frame: overlayToUse,
    frameIdx: params.frameIdx,
    generateArtworkFrame: params.generateArtworkFrame,
    isArtworkMode: params.isArtworkMode,
    previewScanConfigBase: params.previewScanConfigBase,
    temporalOffset,
  });
}
