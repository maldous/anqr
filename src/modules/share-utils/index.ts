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

// Import for default export
import { parseUrlParams, buildUrlParams, updateBrowserUrl, getShareableUrl } from './url-params';
import { generateImageEmbed, generateIframeEmbed, generateMarkdownEmbed, generateBBCodeEmbed, convertToImageApiUrl } from './embed';
import { getSocialShareUrls } from './social';
import { copyToClipboard, copyImageToClipboard } from './clipboard';
import { checkShareUrlLength, canvasToDataUrl, canvasToBlob, downloadBlob, estimateQRSize } from './data-url';

// Default export object for backwards compatibility
export const ShareUtils = {
  // URL params
  parseUrlParams,
  buildUrlParams,
  updateBrowserUrl,
  getShareableUrl,
  checkShareUrlLength,
  convertToImageApiUrl,

  // Embed codes
  generateImageEmbed,
  generateIframeEmbed,
  generateMarkdownEmbed,
  generateBBCodeEmbed,

  // Social
  getSocialShareUrls,
  copyToClipboard,
  copyImageToClipboard,

  // Data
  canvasToDataUrl,
  canvasToBlob,
  downloadBlob,
  estimateQRSize,
};

export default ShareUtils;
