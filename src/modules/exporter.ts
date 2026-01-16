/**
 * Exporter Module
 * Re-exports from split module files
 *
 * Handles PNG, WebP, GIF, and SVG export with full color support
 * Uses gifenc npm package for high-quality GIF encoding
 * Supports native file saving on Android/iOS via Capacitor
 */

export * from './exporter/index';
export { default as ExporterModule } from './exporter/index';
