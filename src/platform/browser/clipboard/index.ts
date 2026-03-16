/**
 * Browser Clipboard Module
 * Clipboard operations for text and images
 *
 * This module provides:
 * - Copy text to clipboard
 * - Copy image to clipboard
 *
 * Rules:
 * - Browser-only APIs (clipboard, document)
 * - No dependencies on other modules
 */

import { createLogger } from "../../../infra/logging/logger";

const _log = createLogger("CLIPBOARD");

// Image clipboard
export { copyImageToClipboard } from "./copy-image";
// Text clipboard
export { copyToClipboard } from "./copy-text";
