/**
 * Share Utilities Module
 * Re-exports from split module files
 */

// Types and constants
export { MAX_SHARE_URL_LENGTH, type ShareConfig, type EmbedOptions } from './types';

// URL parameter functions
export {
  parseUrlParams,
  buildUrlParams,
  updateBrowserUrl,
  getShareableUrl,
} from './url-params';

// Embed code generation
export {
  convertToImageApiUrl,
  generateImageEmbed,
  generateIframeEmbed,
  generateMarkdownEmbed,
  generateBBCodeEmbed,
} from './embed';

// Social sharing
export { getSocialShareUrls } from './social';

// Clipboard operations
export { copyToClipboard, copyImageToClipboard } from './clipboard';

// Data URL helpers
export {
  checkShareUrlLength,
  canvasToDataUrl,
  canvasToBlob,
  downloadBlob,
  estimateQRSize,
} from './data-url';

// Default export object for backwards compatibility
export const ShareUtils = {
  // URL params
  parseUrlParams: async () => (await import('./url-params')).parseUrlParams,
  buildUrlParams: async () => (await import('./url-params')).buildUrlParams,
  updateBrowserUrl: async () => (await import('./url-params')).updateBrowserUrl,
  getShareableUrl: async () => (await import('./url-params')).getShareableUrl,
  checkShareUrlLength: async () => (await import('./data-url')).checkShareUrlLength,

  // Embed codes
  generateImageEmbed: async () => (await import('./embed')).generateImageEmbed,
  generateIframeEmbed: async () => (await import('./embed')).generateIframeEmbed,
  generateMarkdownEmbed: async () => (await import('./embed')).generateMarkdownEmbed,
  generateBBCodeEmbed: async () => (await import('./embed')).generateBBCodeEmbed,

  // Social
  getSocialShareUrls: async () => (await import('./social')).getSocialShareUrls,
  copyToClipboard: async () => (await import('./clipboard')).copyToClipboard,
  copyImageToClipboard: async () => (await import('./clipboard')).copyImageToClipboard,

  // Data
  canvasToDataUrl: async () => (await import('./data-url')).canvasToDataUrl,
  canvasToBlob: async () => (await import('./data-url')).canvasToBlob,
  downloadBlob: async () => (await import('./data-url')).downloadBlob,
  estimateQRSize: async () => (await import('./data-url')).estimateQRSize,
};

export default ShareUtils;
