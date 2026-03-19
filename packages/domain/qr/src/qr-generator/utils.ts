export { validateColor } from "./validate-color";
export { hashString } from "./hash-string";
export { hashCanvasContent } from "@/domain/render/overlay";

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * Re-exported from canonical source for backward compatibility
 */
export { getContrastRatio } from "@/domain/render/color";
/**
 * Create a simple seeded PRNG (mulberry32)
 * Re-exported from canonical source for backward compatibility
 */
export { createRNG as createSeededRandom } from "@/domain/render/primitives";
