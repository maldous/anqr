import {
  generateDeterministicNumericSuffix,
  generateDeterministicSuffix,
  hashStringToSeed,
} from "./rs-basis";
import type { FullQArtConfig } from "./generate.types";

/**
 * Generate QR-Art trying all 8 mask patterns and selecting the best
 * Uses encoder-derived semantic layout for HYBRID protection.
 */
export function resolveSharedSuffix(
  config: Omit<FullQArtConfig, "maskPattern">,
  resolvedSuffixMode: "numeric" | "byte",
  suffixLength: number,
  sharedVersion: number,
): string {
  if (config.suffix !== undefined) return config.suffix;
  if (config.autoSuffix !== false) {
    const baseSeed = hashStringToSeed(config.data + sharedVersion.toString() + config.ecc);
    const searchSeedOffset = config.searchSeed ?? 0;
    const seed = (baseSeed ^ searchSeedOffset) >>> 0;
    if (resolvedSuffixMode === "numeric") {
      return generateDeterministicNumericSuffix(Math.max(0, suffixLength), seed);
    }
    return `#${generateDeterministicSuffix(Math.max(0, suffixLength - 1), seed)}`;
  }
  return "";
}
