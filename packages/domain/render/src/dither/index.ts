// Barrel: domain/render/dither
export type { TemporalDitherMode } from "./temporal.types";
export { calculateTemporalOffset } from "./calculate-temporal-offset";
export { applyTemporalNoiseToCanvas } from "./apply-temporal-noise-to-canvas";
export { generateTemporalSequence } from "./generate-temporal-sequence";
export { isTemporalDitherActive } from "./is-temporal-dither-active";
export { temporalBlueNoiseDither } from "./temporal-blue-noise-dither";
export { applyAdvancedDither } from "./dithering-advanced";
export { distributeError } from "./dithering-error";
export { getDiffusionKernel } from "./dithering-kernels";
export { applyDitherToMatrix } from "./dithering-matrix";
export { applyTrueDither } from "./dithering-true";
export { generateBlueNoiseTile } from "@/modules/dither-algorithms/generate-blue-noise-tile";
export { sampleBlueNoise } from "@/modules/dither-algorithms/sample-blue-noise";
export { createRNG } from "../primitives/create-rng";
export { getOrderedMatrix } from "@/modules/dither-algorithms/get-ordered-matrix";
