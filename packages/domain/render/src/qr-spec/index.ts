/**
 * QR Specification Pure Functions (render-local copy)
 *
 * These are copies of the pure coordinate-checking functions from
 * packages/domain/qr/src/spec/. They are duplicated here to break
 * the circular dependency between render and qr packages.
 *
 * The canonical source remains packages/domain/qr/src/spec/.
 * If you change QR spec logic, update both locations.
 */
export type { ECCLevel } from "./ecc-level.types";
export { getModuleCountForVersion } from "./get-module-count-for-version";
export { getVersionFromModuleCount } from "./get-version-from-module-count";
export { isFinderPattern } from "./is-finder-pattern";
export { isTimingPattern } from "./is-timing-pattern";
export { isFormatInfo } from "./is-format-info";
export { isVersionInfo } from "./is-version-info";
export { getAlignmentPatternCenters } from "./get-alignment-pattern-centers";
export { isAlignmentPattern } from "./is-alignment-pattern";
