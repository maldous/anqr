import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from "@/domain/qr/spec";
import type { QRGeneratorConfig } from "./types";
import { isFinderModuleOrSeparator } from "./is-finder-module-or-separator";

/**
 * Check if a module should be locked based on config preserve/protect settings.
 * This allows users to include structural modules in the overlay rendering when desired.
 * The fixed dark module follows preserveFunctionalPatterns (so artistic dithering can remove it).
 */
export function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig,
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
  const isFinderSeparator = isFinderModuleOrSeparator(row, col, moduleCount, true);

  // Fixed dark module follows global preserve/protect policy.
  // When all preserve/protect options are disabled, allow dithering here too.
  if (row === moduleCount - 8 && col === 8) return preserveFixedDark;

  // Finder modules and separators respect preserveFinders explicitly.
  if (isFinderPattern(row, col, moduleCount)) {
    return preserveFinders;
  }

  if (isFinderSeparator) {
    return preserveFinders;
  }

  // Check timing patterns - lock if preserveTiming is true
  if (isTimingPattern(row, col, moduleCount)) {
    return preserveTiming;
  }

  // Check alignment patterns - lock if preserveAlignment is true
  if (isAlignmentPattern(row, col, moduleCount, version)) {
    return preserveAlignment;
  }

  // Check format info - lock if protectFormatInfo is true
  if (isFormatInfo(row, col, moduleCount)) {
    return protectFormat;
  }

  // Check version info - lock if protectVersionInfo is true
  if (isVersionInfo(row, col, moduleCount, version)) {
    return protectVersion;
  }

  return false;
}
