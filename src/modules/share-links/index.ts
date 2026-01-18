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

// Embed code generation
export {
  convertToImageApiUrl,
  generateBBCodeEmbed,
  generateIframeEmbed,
  generateImageEmbed,
  generateMarkdownEmbed,
} from './embed';
// Social sharing
export { getSocialShareUrls } from './social';
// Types
export { type EmbedOptions, MAX_SHARE_URL_LENGTH, type ShareConfig } from './types';
// URL parameter functions
export {
  buildUrlParams,
  checkShareUrlLength,
  getShareableUrl,
  parseUrlParams,
  parseUrlParamsFromSearchParams,
  updateBrowserUrl,
} from './url-params';
