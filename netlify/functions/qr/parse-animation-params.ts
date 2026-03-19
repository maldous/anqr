import type {
  AnimationEasing,
  AnimationInterpolation,
  AnimationPattern,
  AnimationTemporalDitherMode,
} from "@/contracts/generator";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { parseAnimationTarget } from "./parse-animation-target";
import { parseAnimationWaveAxis } from "./parse-animation-wave-axis";

export function parseAnimationParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "animationPattern"
  | "animationPattern2"
  | "animationLoop"
  | "animationBounce"
  | "animationReverse"
  | "animationColorCycle"
  | "animationTarget"
  | "animationWaveAxis"
  | "animationBounce2"
  | "animationReverse2"
  | "animationColorCycle2"
  | "animationTarget2"
  | "animationWaveAxis2"
  | "animationInterpolate"
  | "animationTemporalDither"
  | "animationModuleJitter"
  | "animationFrames"
  | "animationSpeed"
  | "animationSeed"
  | "animationSeed2"
  | "animationEasing"
  | "animationEasing2"
  | "animationStartFrame"
  | "animationMaxFrames"
  | "animationFrameStep"
> {
  const validAnimationPatterns = new Set<AnimationPattern>([
    "none",
    "pulse",
    "wave",
    "scanline",
    "shimmer",
    "drift",
    "color_cycle",
  ]);
  const validAnimationEasings = new Set<AnimationEasing>([
    "linear",
    "ease_in",
    "ease_out",
    "ease_in_out",
    "bounce",
  ]);
  const parsedP1 = (params.get("animPattern") || "none") as AnimationPattern;
  const animationPattern = validAnimationPatterns.has(parsedP1) ? parsedP1 : "none";
  const parsedP2 = (params.get("animPattern2") || "none") as AnimationPattern;
  const animationPattern2 = validAnimationPatterns.has(parsedP2) ? parsedP2 : "none";
  const animationBounce = params.get("bounce") === "1";
  const animationReverse = params.get("reverse") === "1";
  const animationTarget = parseAnimationTarget(params.get("animTarget"));
  const animationWaveAxis = parseAnimationWaveAxis(params.get("animWaveAxis"));
  const animationFramesRaw = Number.parseInt(params.get("animFrames") || "24", 10);
  const animationSpeedRaw = Number.parseInt(
    params.get("animSpeed") || params.get("speed") || "100",
    10,
  );
  const animationSeed = Number.parseInt(params.get("animSeed") || params.get("seed") || "0", 10);
  const parsedEasing = (params.get("easing") || "linear") as AnimationEasing;
  const animationEasing = validAnimationEasings.has(parsedEasing) ? parsedEasing : "linear";
  const parsedEasing2 = (params.get("easing2") || animationEasing) as AnimationEasing;
  return {
    animationPattern,
    animationPattern2,
    animationLoop: params.get("loop") !== "0",
    animationBounce,
    animationReverse,
    animationColorCycle: params.get("colorCycle") === "1",
    animationTarget,
    animationWaveAxis,
    animationBounce2: params.has("bounce2") ? params.get("bounce2") === "1" : animationBounce,
    animationReverse2: params.has("reverse2") ? params.get("reverse2") === "1" : animationReverse,
    animationColorCycle2: params.has("colorCycle2") ? params.get("colorCycle2") === "1" : false,
    animationTarget2: parseAnimationTarget(params.get("animTarget2"), animationTarget),
    animationWaveAxis2: parseAnimationWaveAxis(
      params.get("animWaveAxis2"),
      animationWaveAxis === "y" ? "x" : animationWaveAxis,
    ),
    animationInterpolate: (params.get("interp") || "none") as AnimationInterpolation,
    animationTemporalDither: (["off", "blue_noise", "flicker_safe"].includes(
      params.get("tempDither") || "",
    )
      ? params.get("tempDither")
      : "off") as AnimationTemporalDitherMode,
    animationModuleJitter: Number.parseFloat(params.get("jitter") || "0"),
    animationFrames: Math.min(
      60,
      Math.max(1, Number.isNaN(animationFramesRaw) ? 24 : animationFramesRaw),
    ),
    animationSpeed: Math.min(
      1000,
      Math.max(10, Number.isNaN(animationSpeedRaw) ? 100 : animationSpeedRaw),
    ),
    animationSeed,
    animationSeed2: Number.parseInt(params.get("animSeed2") || String(animationSeed + 911), 10),
    animationEasing,
    animationEasing2: validAnimationEasings.has(parsedEasing2) ? parsedEasing2 : animationEasing,
    animationStartFrame: Number.parseInt(params.get("startF") || "0", 10),
    animationMaxFrames: Number.parseInt(params.get("maxF") || "0", 10),
    animationFrameStep: Number.parseInt(params.get("stepF") || "1", 10),
  };
}
