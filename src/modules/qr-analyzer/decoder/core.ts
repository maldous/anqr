import { detectContentType, extractDominantColors } from '../content/content';

import { analyzeQRCode } from './api/analyzeQRCode';
import { analyzeQRFromFile } from './api/analyzeQRFromFile';
import { analyzeQRFromUrl } from './api/analyzeQRFromUrl';
import { estimateModulePx } from './location/estimateModulePx';
import { detectEncodingMode } from './payload/detectEncodingMode';

// Auto-split core barrel. Public API preserved.
export { analyzeQRCode, analyzeQRFromFile, analyzeQRFromUrl, estimateModulePx, detectEncodingMode };
export { detectContentType, extractDominantColors };

// ============================================
// EXPORT (compat)
// ============================================

export const QRAnalyzer = {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
  detectEncodingMode,
  detectContentType,
  extractDominantColors,
  estimateModulePx,
};

export default QRAnalyzer;
