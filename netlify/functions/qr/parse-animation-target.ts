import type { AnimationTarget } from "@/contracts/generator";

export function parseAnimationTarget(
  value: string | null | undefined,
  fallback: AnimationTarget = "result",
): AnimationTarget {
  switch ((value || "").toLowerCase()) {
    case "modules":
      return "modules";
    case "both":
      return "both";
    case "result":
      return "result";
    default:
      return fallback;
  }
}
