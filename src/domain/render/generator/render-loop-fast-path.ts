import { buildFunctionalMap } from './build-functional-map';
import { clearFunctionalMapCache } from './clear-functional-map-cache';
import {
  PATTERN_ALIGNMENT,
  PATTERN_FINDER,
  PATTERN_FIXED_DARK,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from './functional-pattern-flags.const';
import { getCachedFunctionalMap } from './get-cached-functional-map';
import { canUseFastPath } from './can-use-fast-path';
import { renderModulesFastPath } from './render-modules-fast-path';

export {
  canUseFastPath,
  clearFunctionalMapCache,
  getCachedFunctionalMap,
  PATTERN_ALIGNMENT,
  PATTERN_FINDER,
  PATTERN_FIXED_DARK,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
  renderModulesFastPath,
};
