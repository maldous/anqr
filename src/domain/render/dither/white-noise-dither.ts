import { createNoiseThresholdDither } from './create-noise-threshold-dither';

/** Apply white noise dithering */
export const whiteNoiseDither = createNoiseThresholdDither((rng) => rng());
