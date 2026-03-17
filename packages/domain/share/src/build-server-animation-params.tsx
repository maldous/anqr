import type { ShareConfig } from "./types";
import { buildServerAnimPatternAxisParams } from "./build-server-anim-pattern-axis-params";

export function buildServerAnimationParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  buildServerAnimPatternAxisParams(config, params);
  if (config.animationFrames !== undefined && config.animationFrames !== 24)
    params.set("animFrames", config.animationFrames.toString());
  if (config.animationSpeed !== undefined && config.animationSpeed !== 100)
    params.set("animSpeed", config.animationSpeed.toString());
  if (config.animationSeed !== undefined && config.animationSeed !== 0)
    params.set("animSeed", config.animationSeed.toString());
}
