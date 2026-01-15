import {for, imageData, scale, upscale} from '../shared';
/**
 * Decide whether to upscale the input prior to detection/sampling.
 * Upscaling is applied only for small inputs to keep performance sane.
 */
export function maybeUpscaleForQR(imageData: ImageData): { imageData: ImageData; scale: number }

