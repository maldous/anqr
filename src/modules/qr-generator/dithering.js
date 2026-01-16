/**
 * QR Generator Dithering Module
 * Re-exports from split module files
 */

export { getDiffusionKernel } from './dithering-kernels.js';
export { distributeError } from './dithering-error.js';
export { applyDitherToMatrix } from './dithering-matrix.js';
export { applyAdvancedDither } from './dithering-advanced.js';
export { applyTrueDither } from './dithering-true.js';
