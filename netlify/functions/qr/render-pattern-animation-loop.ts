import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "../../src/modules/qr-generator";
import { AnimationEffectConfig } from "./animation-effect-config.types";
import { AnimationInterpolation } from "./animation-interpolation.types";
import { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.types";
import { ArtworkState } from "./artwork-state.types";
import { ECCLevel } from "./ecc-level.types";
import { WatermarkOptions } from "./watermark-options.types";
import { applyAnimationEffectsToCanvasServer } from "./apply-animation-effects-to-canvas-server";
import { applyFrameInterpolation } from "./apply-frame-interpolation";
import { applyModuleAnimationToConfigServer } from "./apply-module-animation-to-config-server";
import { renderQRFrameWithFallback } from "./render-qr-frame-with-fallback";
import { generateArtworkFrame } from "./generate-artwork-frame";
import { applyResultEffectsForFrameHelper } from "./apply-result-effects-for-frame-helper";
import { scaleAndWatermarkFrame } from "./scale-and-watermark-frame";

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
  const result: Canvas[] = [];
  let previousRawModuleInput: Canvas | null = null;
  let previousRenderedOutput: Canvas | null = null;
  for (let i = 0; i < totalAnimFrames; i++) {
    let moduleOverlayInput = overlayCanvas;
    if (moduleOverlayInput && moduleAnimationEffects.length > 0 && !isArtworkMode) {
      moduleOverlayInput = applyAnimationEffectsToCanvasServer(
        moduleOverlayInput,
        moduleAnimationEffects,
        i,
        totalAnimFrames,
      );
    }

    if (moduleOverlayInput) {
      moduleOverlayInput = applyFrameInterpolation(
        moduleOverlayInput,
        previousRawModuleInput,
        animationInterpolate,
      );
      previousRawModuleInput = moduleOverlayInput;
    }

    const frameConfig = applyModuleAnimationToConfigServer(
      config as Record<string, unknown>,
      moduleAnimationEffects,
      i,
      totalAnimFrames,
      animationModuleJitter,
    ) as typeof config;

    const artworkTarget = (moduleOverlayInput || overlayCanvas) as Canvas;
    let frameCanvas = await renderQRFrameWithFallback(
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
      frameConfig as Record<string, unknown>,
    );

    frameCanvas = applyResultEffectsForFrameHelper(
      frameCanvas,
      i,
      totalAnimFrames,
      resultAnimationEffects,
      animationTemporalDither,
      animationSeed,
      isArtworkMode,
    );
    frameCanvas = applyFrameInterpolation(
      frameCanvas,
      previousRenderedOutput,
      animationInterpolate,
    );
    previousRenderedOutput = frameCanvas;

    result.push(scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts));
  }
  return result;
}
