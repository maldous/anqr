import type { ShareConfig } from "./types";

export function buildAnimPatternSecondaryParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.pattern2 && config.pattern2 !== "none") params.set("animPattern2", config.pattern2);
  if (config.target2 && config.pattern2 && config.pattern2 !== "none")
    params.set("animTarget2", config.target2);
  if (config.waveAxis2 && config.waveAxis2 !== "x") params.set("animWaveAxis2", config.waveAxis2);
  if (config.moduleJitter !== undefined && config.moduleJitter !== 0)
    params.set("jitter", config.moduleJitter.toString());
  if (config.colorCycle) params.set("colorCycle", "1");
  if (config.seed !== undefined && config.seed !== 0) params.set("seed", config.seed.toString());
  if (config.easing && config.easing !== "linear") params.set("easing", config.easing);
}
