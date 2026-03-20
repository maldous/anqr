import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "@/domain/qr/generator";
import type {
  AnimationEffectConfig,
  AnimationInterpolation,
  AnimationTemporalDitherMode,
  ArtworkState,
  ECCLevel,
  WatermarkOptions,
} from "@/domain/render/server";
import { scaleAndWatermarkFrame } from "@/domain/render/server";

import { generateArtworkFrame } from "./generate-artwork-frame";
import { renderFrameSequence } from "./render-frame-sequence";
import { renderQRFrameWithFallback } from "./render-qr-frame-with-fallback";

export async function renderPatternAnimationLoop(
  overlayCanvas: Canvas | null,
  isArtworkMode: boolean,
  moduleAnimationEffects: AnimationEffectConfig[],
  resultAnimationEffects: AnimationEffectConfig[],
  animationInterpolate: AnimationInterpolation,
  animationTemporalDither: AnimationTemporalDitherMode,
  animationSeed: number,
  animationModuleJitter: number,
  totalAnimFrames: number,
  config: Record<string, unknown>,
  artworkState: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: "auto" | number,
  qrGenerator: QRGenerator,
  outputWidth: number,
  outputHeight: number,
  watermarkOpts: WatermarkOptions | null,
): Promise<Canvas[]> {
  return renderFrameSequence({
    frames: Array.from({ length: totalAnimFrames }, (_, frameIndex) => frameIndex),
    isArtworkMode,
    moduleAnimationEffects,
    resultAnimationEffects,
    animationInterpolate,
    animationTemporalDither,
    animationSeed,
    animationModuleJitter,
    config,
    getModuleInput: () => overlayCanvas,
    renderFrame: (moduleOverlayInput, i, frameConfig) => {
      const artworkTarget = (moduleOverlayInput || overlayCanvas) as Canvas;
      return renderQRFrameWithFallback(
        artworkTarget,
        i,
        isArtworkMode && !!artworkTarget,
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
    },
    finalizeFrame: (frameCanvas) =>
      scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts),
  });
}
