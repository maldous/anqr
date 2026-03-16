import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "../../src/modules/qr-generator";
import { type AnimationEasing } from "../../src/modules/animation";
import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { ServerAnimationFrame } from "./server-animation-frame.types.ts";
import { ArtworkState } from "./artwork-state.types.ts";
import { WatermarkOptions } from "./watermark-options.types.ts";
import { AnimationEffectConfig } from "./animation-effect-config.types.ts";
import { buildAnimationEffectArrays } from "./build-animation-effect-arrays.ts";
import { renderAnimatedOverlayLoop } from "./render-animated-overlay-loop.ts";
import { generatePatternFramesServer } from "./generate-pattern-frames-server.ts";
import { renderPatternAnimationLoop } from "./render-pattern-animation-loop.ts";

export async function generateGifAnimationFrames(
  p: ParsedHandlerParams,
  config: Record<string, unknown>,
  outputCanvas: Canvas,
  overlayCanvas: Canvas | null,
  overlayFrames: ServerAnimationFrame[],
  hasAnimatedOverlay: boolean,
  artworkState: ArtworkState,
  totalMargin: number,
  estimatedModuleCount: number,
  qrGenerator: QRGenerator,
  watermarkOpts: WatermarkOptions | null,
): Promise<{ animationFrameCanvases: Canvas[]; animatedOverlayFrames: ServerAnimationFrame[] }> {
  const isArtworkMode = p.overlayMode === "artwork";
  const primaryAnimationEffect: AnimationEffectConfig = {
    pattern: p.animationPattern,
    seed: p.animationSeed,
    easing: p.animationEasing as AnimationEasing,
    colorCycle: p.animationColorCycle,
    reverse: p.animationReverse,
    bounce: p.animationBounce,
    target: p.animationTarget,
    waveAxis: p.animationWaveAxis,
  };
  const secondaryAnimationEffect: AnimationEffectConfig = {
    pattern: p.animationPattern2,
    seed: p.animationSeed2,
    easing: p.animationEasing2 as AnimationEasing,
    colorCycle: p.animationColorCycle2,
    reverse: p.animationReverse2,
    bounce: p.animationBounce2,
    target: p.animationTarget2,
    waveAxis: p.animationWaveAxis2,
  };
  const { moduleAnimationEffects, resultAnimationEffects, hasAnyAnimationEffects } =
    buildAnimationEffectArrays(
      primaryAnimationEffect,
      secondaryAnimationEffect,
      p.animationTemporalDither,
    );

  let animationFrameCanvases: Canvas[] = [];
  let animatedOverlayFrames: ServerAnimationFrame[] = [];

  if (hasAnimatedOverlay && overlayFrames.length > 1) {
    animatedOverlayFrames = await renderAnimatedOverlayLoop(
      overlayFrames,
      isArtworkMode,
      moduleAnimationEffects,
      resultAnimationEffects,
      p.animationInterpolate,
      p.animationTemporalDither,
      p.animationSeed,
      p.animationModuleJitter,
      config,
      totalMargin,
      estimatedModuleCount,
      artworkState,
      p.data,
      p.ec,
      p.version,
      p.maskPattern,
      qrGenerator,
      p.outputWidth,
      p.outputHeight,
      watermarkOpts,
      p.gifDisposalCode,
    );
  } else if (hasAnyAnimationEffects) {
    const totalAnimFrames = Math.max(1, p.animationFrames);
    const canUseFastPatternPath =
      moduleAnimationEffects.length === 0 &&
      resultAnimationEffects.length === 1 &&
      p.animationInterpolate === "none" &&
      p.animationTemporalDither === "off";

    if (canUseFastPatternPath) {
      const effect = resultAnimationEffects[0];
      animationFrameCanvases = generatePatternFramesServer(
        outputCanvas,
        effect.pattern,
        totalAnimFrames,
        effect.seed,
        effect.easing,
        effect.waveAxis,
        effect.colorCycle,
        effect.reverse,
        effect.bounce,
      );
    } else {
      animationFrameCanvases = await renderPatternAnimationLoop(
        overlayCanvas,
        isArtworkMode,
        moduleAnimationEffects,
        resultAnimationEffects,
        p.animationInterpolate,
        p.animationTemporalDither,
        p.animationSeed,
        p.animationModuleJitter,
        totalAnimFrames,
        config,
        artworkState,
        p.data,
        p.ec,
        p.version,
        p.maskPattern,
        qrGenerator,
        p.outputWidth,
        p.outputHeight,
        watermarkOpts,
      );
    }
  }
  return { animationFrameCanvases, animatedOverlayFrames };
}
