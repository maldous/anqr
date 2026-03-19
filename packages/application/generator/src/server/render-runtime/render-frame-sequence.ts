import { type Canvas } from "@napi-rs/canvas";
import type {
  AnimationEffectConfig,
  AnimationInterpolation,
  AnimationTemporalDitherMode,
} from "@/domain/render/server";
import {
  applyAnimationEffectsToCanvasServer,
  applyFrameInterpolation,
  applyModuleAnimationToConfigServer,
  applyResultEffectsForFrameHelper,
} from "@/domain/render/server";

type RenderFrameSequenceOptions<TFrameInput, TResult> = {
  frames: TFrameInput[];
  isArtworkMode: boolean;
  moduleAnimationEffects: AnimationEffectConfig[];
  resultAnimationEffects: AnimationEffectConfig[];
  animationInterpolate: AnimationInterpolation;
  animationTemporalDither: AnimationTemporalDitherMode;
  animationSeed: number;
  animationModuleJitter: number;
  config: Record<string, unknown>;
  getModuleInput: (frame: TFrameInput, frameIndex: number) => Canvas | null;
  renderFrame: (
    moduleOverlayInput: Canvas | null,
    frameIndex: number,
    frameConfig: Record<string, unknown>,
  ) => Promise<Canvas>;
  finalizeFrame: (frameCanvas: Canvas, frame: TFrameInput, frameIndex: number) => TResult;
};

export async function renderFrameSequence<TFrameInput, TResult>(
  options: RenderFrameSequenceOptions<TFrameInput, TResult>,
): Promise<TResult[]> {
  const result: TResult[] = [];
  let previousRawModuleInput: Canvas | null = null;
  let previousRenderedOutput: Canvas | null = null;
  const totalFrames = options.frames.length;

  for (let i = 0; i < totalFrames; i++) {
    let moduleOverlayInput = options.getModuleInput(options.frames[i], i);
    if (moduleOverlayInput && options.moduleAnimationEffects.length > 0 && !options.isArtworkMode) {
      moduleOverlayInput = applyAnimationEffectsToCanvasServer(
        moduleOverlayInput,
        options.moduleAnimationEffects,
        i,
        totalFrames,
      );
    }

    if (moduleOverlayInput) {
      moduleOverlayInput = applyFrameInterpolation(
        moduleOverlayInput,
        previousRawModuleInput,
        options.animationInterpolate,
      );
      previousRawModuleInput = moduleOverlayInput;
    }

    const frameConfig = applyModuleAnimationToConfigServer(
      options.config,
      options.moduleAnimationEffects,
      i,
      totalFrames,
      options.animationModuleJitter,
    ) as Record<string, unknown>;

    let frameCanvas = await options.renderFrame(moduleOverlayInput, i, frameConfig);
    frameCanvas = applyResultEffectsForFrameHelper(
      frameCanvas,
      i,
      totalFrames,
      options.resultAnimationEffects,
      options.animationTemporalDither,
      options.animationSeed,
      options.isArtworkMode,
    );
    frameCanvas = applyFrameInterpolation(
      frameCanvas,
      previousRenderedOutput,
      options.animationInterpolate,
    );
    previousRenderedOutput = frameCanvas;

    result.push(options.finalizeFrame(frameCanvas, options.frames[i], i));
  }

  return result;
}
