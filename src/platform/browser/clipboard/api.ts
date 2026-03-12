/**
 * Browser Clipboard Module - Public API Manifest
 *
 * This file documents all public exports from the browser-clipboard module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('CLIPBOARD');

// Text clipboard
export const TEXT_API = ['copyToClipboard'] as const;

// Image clipboard
export const IMAGE_API = ['copyImageToClipboard'] as const;

// All public exports
export const PUBLIC_API = [...TEXT_API, ...IMAGE_API] as const;
