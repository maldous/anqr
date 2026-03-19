/**
 * Share Links Module - Public API Manifest
 *
 * This file documents all public exports from the share-links module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from "@/domain/logging";

const _log = createLogger("SHARE");

// URL parameter functions
export const URL_PARAMS_API = [
  "buildUrlParams",
  "parseUrlParams",
  "getShareableUrl",
  "checkShareUrlLength",
  "updateBrowserUrl",
] as const;

// Embed code generation
export const EMBED_API = [
  "generateImageEmbed",
  "generateIframeEmbed",
  "generateMarkdownEmbed",
  "generateBBCodeEmbed",
  "convertToImageApiUrl",
] as const;

// Social sharing
export const SOCIAL_API = ["getSocialShareUrls"] as const;

// Constants
export const CONSTANTS = ["MAX_SHARE_URL_LENGTH"] as const;

// Types
export const TYPES = ["EmbedOptions", "ShareConfig"] as const;

// All public exports
export const PUBLIC_API = [...URL_PARAMS_API, ...EMBED_API, ...SOCIAL_API, ...CONSTANTS] as const;
