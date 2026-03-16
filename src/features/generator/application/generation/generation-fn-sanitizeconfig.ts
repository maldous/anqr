/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Sanitize QR generator config to plain object.
 */

import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { clonePlainSerializable } from "@/features/generator/application/generation/generation-fn-cloneserializable";

export function sanitizeQArtRenderConfig(config: QRGeneratorConfig): Record<string, unknown> {
  const sanitized = clonePlainSerializable(config);
  return (sanitized && typeof sanitized === "object" ? sanitized : {}) as Record<string, unknown>;
}
