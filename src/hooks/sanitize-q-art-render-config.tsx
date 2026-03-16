import type { QRGeneratorConfig } from "../domain/render/generator";
import { clonePlainSerializable } from "./clone-plain-serializable";

export function sanitizeQArtRenderConfig(config: QRGeneratorConfig): Record<string, unknown> {
  const sanitized = clonePlainSerializable(config);
  return (sanitized && typeof sanitized === "object" ? sanitized : {}) as Record<string, unknown>;
}
