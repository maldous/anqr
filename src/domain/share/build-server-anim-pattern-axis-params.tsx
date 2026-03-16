import type { ShareConfig } from "./types";

export function buildServerAnimPatternAxisParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.animationPattern && config.animationPattern !== "none")
    params.set("animPattern", config.animationPattern);
  if (config.animationTarget && config.animationTarget !== "result")
    params.set("animTarget", config.animationTarget);
  if (config.animationWaveAxis && config.animationWaveAxis !== "y")
    params.set("animWaveAxis", config.animationWaveAxis);
  if (config.animationPattern2 && config.animationPattern2 !== "none")
    params.set("animPattern2", config.animationPattern2);
  if (config.animationTarget2 && config.animationTarget2 !== "result")
    params.set("animTarget2", config.animationTarget2);
  if (config.animationWaveAxis2 && config.animationWaveAxis2 !== "x")
    params.set("animWaveAxis2", config.animationWaveAxis2);
}
