/**
 * Exporter Module - Utilities
 * Common utility functions for file export
 */

/**
 * Escape XML special characters */

import { createLogger } from "@/domain/logging";

const _log = createLogger("EXPORT");

export function escapeXml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
