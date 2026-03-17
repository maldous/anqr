import type { ShareConfig } from "./types";
import { buildAnimPatternPrimaryParams } from "./build-anim-pattern-primary-params";
import { buildAnimPatternSecondaryParams } from "./build-anim-pattern-secondary-params";

export function buildAnimationPatternParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  buildAnimPatternPrimaryParams(config, params);
  buildAnimPatternSecondaryParams(config, params);
}
