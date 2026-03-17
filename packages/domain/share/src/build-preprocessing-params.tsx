import type { ShareConfig } from "./types";
import { buildPreprocessingColorParams } from "./build-preprocessing-color-params";
import { buildPreprocessingFilterParams } from "./build-preprocessing-filter-params";

export function buildPreprocessingParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  buildPreprocessingColorParams(config, params);
  buildPreprocessingFilterParams(config, params);
}
