import { QRGenerator } from "../../src/modules/qr-generator";
import { type Canvas } from "@napi-rs/canvas";
import { ServerAnimationFrame } from "./server-animation-frame.types.ts";
import { AnimationEffectConfig } from "./animation-effect-config.types.ts";
import { AnimationInterpolation } from "./animation-interpolation.types.ts";
import { AnimationTemporalDitherMode } from "./animation-temporal-dither-mode.types.ts";
import { ArtworkState } from "./artwork-state.types.ts";
import { ECCLevel } from "./ecc-level.types.ts";
import { WatermarkOptions } from "./watermark-options.types.ts";
import { qrFnLog } from "./qr-fn-log.ts";
import { applyAnimationEffectsToCanvasServer } from "./apply-animation-effects-to-canvas-server.ts";
import { applyFrameInterpolation } from "./apply-frame-interpolation.ts";
import { applyModuleAnimationToConfigServer } from "./apply-module-animation-to-config-server.ts";
import { renderQRFrameWithFallback } from "./render-qr-frame-with-fallback.ts";
import { generateArtworkFrame } from "./generate-artwork-frame.ts";
import { applyResultEffectsForFrameHelper } from "./apply-result-effects-for-frame-helper.ts";
import { sleep } from "./sleep.ts";
import { scaleAndWatermarkFrame } from "./scale-and-watermark-frame.ts";

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
  let previousRawModuleInput: Canvas | null = null;
  let previousRenderedOutput: Canvas | null = null;
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

  const result: ServerAnimationFrame[] = [];
  for (let i = 0; i < overlayFrames.length; i++) {
    const tFrame = Date.now();
    const overlayFrame = overlayFrames[i];
    let moduleOverlayInput = isArtworkMode
      ? overlayFrame.canvas
      : applyAnimationEffectsToCanvasServer(
          overlayFrame.canvas,
          moduleAnimationEffects,
          i,
          overlayFrames.length,
        );

    const rawModuleInput = moduleOverlayInput;
    moduleOverlayInput = applyFrameInterpolation(
      moduleOverlayInput,
      previousRawModuleInput,
      animationInterpolate,
    );
    previousRawModuleInput = rawModuleInput;

    const frameConfig = applyModuleAnimationToConfigServer(
      animConfig as Record<string, unknown>,
      moduleAnimationEffects,
      i,
      overlayFrames.length,
      animationModuleJitter,
    ) as typeof config;

    let frameCanvas = await renderQRFrameWithFallback(
      moduleOverlayInput,
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

    frameCanvas = applyResultEffectsForFrameHelper(
      frameCanvas,
      i,
      overlayFrames.length,
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

    if (i > 0 && i % 3 === 0) {
      await sleep(1);
    }
    if (i % 10 === 0 || i === overlayFrames.length - 1) {
      qrFnLog("[ANIMATION] frame progress", {
        frame: i + 1,
        total: overlayFrames.length,
        frameMs: Date.now() - tFrame,
        elapsedMs: Date.now() - tAnimStart,
      });
    }

    result.push({
      canvas: scaleAndWatermarkFrame(frameCanvas, outputWidth, outputHeight, watermarkOpts),
      delay: overlayFrame.delay,
      disposalType: gifDisposalCode,
    });
  }
  qrFnLog("[ANIMATION] all frames rendered", {
    frames: result.length,
    totalMs: Date.now() - tAnimStart,
  });
  return result;
}
