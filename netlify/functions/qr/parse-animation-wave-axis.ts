import type { AnimationWaveAxis } from "./animation-wave-axis.types";

export function parseAnimationWaveAxis(
  value: string | null | undefined,
  fallback: AnimationWaveAxis = "y",
): AnimationWaveAxis {
  switch ((value || "").toLowerCase()) {
    case "x":
    case "horizontal":
    case "left_right":
    case "left-right":
      return "x";
    case "xy":
    case "both":
    case "dual":
      return "xy";
    case "y":
    case "vertical":
    case "top_bottom":
    case "top-bottom":
      return "y";
    default:
      return fallback;
  }
}
