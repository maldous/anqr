import { createNoiseThresholdDither } from './create-noise-threshold-dither';

/** Apply triangular noise dithering (TPDF) */
export const triangularNoiseDither = createNoiseThresholdDither((rng) => (rng() + rng()) / 2);
