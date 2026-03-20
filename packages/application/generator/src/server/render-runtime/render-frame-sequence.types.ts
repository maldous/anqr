import { type Canvas } from "@napi-rs/canvas";
import type {
  AnimationEffectConfig,
  AnimationInterpolation,
  AnimationTemporalDitherMode,
} from "@/domain/render/server";

export type RenderFrameSequenceOptions<TFrameInput, TResult> = {
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
