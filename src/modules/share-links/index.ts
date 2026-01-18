/**
 * Share Links Module
 * URL parameter handling, embed code generation, and social sharing
 * 
 * This module provides:
 * - URL parameter parsing and serialization
 * - Shareable URL building and length checks
 * - Embed code generation (HTML, iframe, markdown, BBCode)
 * - Social share URL building
 * 
 * Rules:
 * - No dependencies on browser-io or browser-clipboard (use those modules directly)
 * - Pure URL/string manipulation
 */

// Types
export { MAX_SHARE_URL_LENGTH, type ShareConfig, type EmbedOptions } from './types';

// URL parameter functions
export {
  parseUrlParams,
  buildUrlParams,
  updateBrowserUrl,
  getShareableUrl,
  checkShareUrlLength,
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
