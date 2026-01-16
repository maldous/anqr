/**
 * QR Generator Module
 * Re-exports from split module files in qr-generator/ subdirectory
 */

export * from './qr-generator/index.js';

// Re-export clearQRCaches at top level for backwards compatibility
export { clearQRCaches, defaultBrowserCanvasFactory, QRGenerator } from './qr-generator/index.js';
