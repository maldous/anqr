/**
 * Animation Module
 * Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects
 *
 * Performance optimizations:
 * - Canvas pooling to reduce GC pressure
 * - Frame decimation based on target FPS
 * - Reusable composite canvas for GIF parsing
 */

export * from './animation/index';
export { default } from './animation/index';
