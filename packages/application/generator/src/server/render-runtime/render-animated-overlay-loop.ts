import { QRGenerator } from "@/domain/qr/generator";
import type {
  AnimationEffectConfig,
  AnimationInterpolation,
  AnimationTemporalDitherMode,
  ArtworkState,
  ECCLevel,
  ServerAnimationFrame,
  WatermarkOptions,
} from "@/domain/render/server";
import {
  qrFnLog,
  scaleAndWatermarkFrame,
  sleep,
} from "@/domain/render/server";

import { generateArtworkFrame } from "./generate-artwork-frame";
import { renderFrameSequence } from "./render-frame-sequence";
import { renderQRFrameWithFallback } from "./render-qr-frame-with-fallback";

export async function renderAnimatedOverlayLoop(
  overlayFrames: ServerAnimationFrame[],
  isArtworkMode: boolean,
  moduleAnimationEffects: AnimationEffectConfig[],
  resultAnimationEffects: AnimationEffectConfig[],
  animationInterpolate: AnimationInterpolation,
  animationTemporalDither: AnimationTemporalDitherMode,
  animationSeed: number,
  animationModuleJitter: number,
  config: Record<string, unknown>,
  totalMargin: number,
  estimatedModuleCount: number,
  artworkState: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: "auto" | number,
  qrGenerator: QRGenerator,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null,
  gifDisposalCode: number,
): Promise<ServerAnimationFrame[]> {
  const ANIM_RENDER_SIZE = 240;
  const animModuleSize = Math.max(
    1,
    Math.floor((ANIM_RENDER_SIZE - totalMargin * 2) / (estimatedModuleCount + totalMargin * 2)),
  );
  const animRenderScale = Math.max(1, Math.round(ANIM_RENDER_SIZE / estimatedModuleCount));
  const animConfig = {
    ...config,
    moduleSize: animModuleSize,
    renderScalePerModule: animRenderScale,
    renderScaleMinimum: 1,
  };
  const tAnimStart = Date.now();
  qrFnLog("[ANIMATION] starting animated overlay", {
    frames: overlayFrames.length,
    renderSize: ANIM_RENDER_SIZE,
    animModuleSize,
    animRenderScale,
    outputSize: `${outputWidth}x${outputHeight}`,
    moduleEffects: moduleAnimationEffects.length,
    resultEffects: resultAnimationEffects.length,
  });

  const result = await renderFrameSequence({
    frames: overlayFrames,
    isArtworkMode,
    moduleAnimationEffects,
    resultAnimationEffects,
    animationInterpolate,
    animationTemporalDither,
    animationSeed,
    animationModuleJitter,
    config: animConfig as Record<string, unknown>,
    getModuleInput: (overlayFrame) => {
      const tFrame = Date.now();
      (globalThis as Record<string, unknown>).__ANQR_FRAME_START__ = tFrame;
      return isArtworkMode ? overlayFrame.canvas : overlayFrame.canvas;
    },
    renderFrame: async (moduleOverlayInput, i, frameConfig) => {
      const overlayFrame = overlayFrames[i];
      const tFrame = (globalThis as Record<string, unknown>).__ANQR_FRAME_START__ as number | undefined;
      const frameCanvas = await renderQRFrameWithFallback(
        moduleOverlayInput ?? overlayFrame.canvas,
        i,
        isArtworkMode,
        (target, idx, normalize) =>
          generateArtworkFrame(
            target,
            idx,
            normalize,
            artworkState,
            data,
            ec,
            version,
            maskPattern,
            config,
            qrGenerator,
          ),
        qrGenerator,
        frameConfig,
      );
      if (i > 0 && i % 3 === 0) {
        await sleep(1);
      }
      if (i % 10 === 0 || i === overlayFrames.length - 1) {
        qrFnLog("[ANIMATION] frame progress", {
          frame: i + 1,
          total: overlayFrames.length,
          frameMs: Date.now() - (tFrame ?? Date.now()),
          elapsedMs: Date.now() - tAnimStart,
        });
      }
      return frameCanvas;
    },
    finalizeFrame: (frameCanvas, overlayFrame) => ({
      canvas: scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts),
      delay: overlayFrame.delay,
      disposalType: gifDisposalCode,
    }),
  });
  qrFnLog("[ANIMATION] all frames rendered", {
    frames: result.length,
    totalMs: Date.now() - tAnimStart,
  });
  return result;
}
