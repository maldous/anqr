/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Download QR code as animated GIF.
 */

import { createLogger } from '@/infra/logging/logger';
import type { ExporterModule } from '@/features/generator/application/export/export-shared-types';
import type { AnimationFrame } from '@/modules/animation/types';
import { createElement } from 'react';

const log = createLogger('QR');


export async function downloadAnimatedGifFormat(params: {
  exporter: ExporterModule;
  cachedAnimationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
  exportConfig: Record<string, unknown>;
  outputWidthPx: number;
  outputHeightPx: number;
  crispEdges: boolean;
  animationSpeedMs: number;
  animationLoop: boolean;
  effectiveFrames: AnimationFrame[];
  gifUseFrameDelays: boolean;
  gifMaxFps: number;
}): Promise<void> {
  const scaledFrames = params.cachedAnimationFrames.map((frame) => {
    const frameCanvas = frame as HTMLCanvasElement;
    if (
      frameCanvas.width === params.outputWidthPx &&
      frameCanvas.height === params.outputHeightPx
    ) {
      return frameCanvas;
    }
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = params.outputWidthPx;
    scaledCanvas.height = params.outputHeightPx;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (scaledCtx) {
      scaledCtx.imageSmoothingEnabled = !params.crispEdges;
      scaledCtx.imageSmoothingQuality = 'high';
      scaledCtx.drawImage(frameCanvas, 0, 0, params.outputWidthPx, params.outputHeightPx);
    }
    return scaledCanvas;
  });
  let frameDelays: number[] | undefined;
  if (params.gifUseFrameDelays && params.effectiveFrames.length > 0) {
    const minDelayMs = params.gifMaxFps > 0 ? Math.floor(1000 / params.gifMaxFps) : 0;
    frameDelays = params.effectiveFrames.map((f) =>
      Math.max(f.delay || params.animationSpeedMs, minDelayMs)
    );
  } else if (params.cachedAnimationFrames.length > 1 && params.effectiveFrames.length === 0) {
    frameDelays = params.cachedAnimationFrames.map(() => params.animationSpeedMs);
  }
  log.debug('download GIF: delays computed', {
    effectiveFramesLen: params.effectiveFrames.length,
    animationFramesLen: params.cachedAnimationFrames.length,
    scaledFramesLen: scaledFrames.length,
    frameDelaysLen: frameDelays?.length,
    minDelay: frameDelays ? Math.min(...frameDelays) : undefined,
    maxDelay: frameDelays ? Math.max(...frameDelays) : undefined,
    totalMs: frameDelays?.reduce((s, d) => s + d, 0),
    gifUseFrameDelays: params.gifUseFrameDelays,
    gifMaxFps: params.gifMaxFps,
    animSpeedMs: params.animationSpeedMs,
  });
  await params.exporter.downloadGif(
    scaledFrames,
    {
      ...params.exportConfig,
      animationSpeed: params.animationSpeedMs,
      loopAnimation: params.animationLoop,
    },
    frameDelays
  );
}

