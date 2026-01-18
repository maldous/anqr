/**
 * Share Utilities Module
 * Re-exports sharing functionality from share-utils/ subdirectory
 */

export {
  buildUrlParams,
  parseUrlParams,
  updateBrowserUrl,
  getShareableUrl,
  checkShareUrlLength,
  convertToImageApiUrl,
  getSocialShareUrls,
  generateImageEmbed,
  generateIframeEmbed,
  generateMarkdownEmbed,
  generateBBCodeEmbed,
  estimateQRSize,
  canvasToBlob,
  canvasToDataUrl,
  copyToClipboard,
  copyImageToClipboard,
  downloadBlob,
  ShareUtils,
  MAX_SHARE_URL_LENGTH,
  type ShareConfig,
  type EmbedOptions,
} from './share-utils/';

export default ShareUtils;
