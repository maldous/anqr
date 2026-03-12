import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../../qr/spec/qr-patterns';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { isFinderSeparator } from './is-finder-separator';

/**
 * Check if a module should remain lock-protected based on preservation settings.
 */
export function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  const preserveFinders = config.preserveFinders !== false;
  const preserveTiming = preserveFunctional
    ? config.preserveTiming !== false
    : config.preserveTiming === true;
  const preserveAlignment = preserveFunctional
    ? config.preserveAlignment !== false
    : config.preserveAlignment === true;
  const protectFormat = preserveFunctional
    ? config.protectFormatInfo !== false
    : config.protectFormatInfo === true;
  const protectVersion = preserveFunctional
    ? config.protectVersionInfo !== false
    : config.protectVersionInfo === true;
  const preserveFixedDark = preserveFunctional;

  if (row === moduleCount - 8 && col === 8) return preserveFixedDark;
  if (isFinderPattern(row, col, moduleCount) || isFinderSeparator(row, col, moduleCount)) {
    return preserveFinders;
  }
  if (isTimingPattern(row, col, moduleCount)) return preserveTiming;
  if (isAlignmentPattern(row, col, moduleCount, version)) return preserveAlignment;
  if (isFormatInfo(row, col, moduleCount)) return protectFormat;
  if (isVersionInfo(row, col, moduleCount, version)) return protectVersion;
  return false;
}
