import { type Canvas } from "@napi-rs/canvas";
import {
  applyAnimationEffectsToCanvasServer,
  applyFrameInterpolation,
  applyModuleAnimationToConfigServer,
  applyResultEffectsForFrameHelper,
} from "@/domain/render/server";
import type { RenderFrameSequenceOptions } from "./render-frame-sequence.types";

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
