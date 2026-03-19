import type { LightningParams } from "./payload-generators/types";

/**
 * Generate Lightning Network invoice URI (BOLT11)
 */
export function generateLightning(params: LightningParams): string {
  const invoice = params.invoice.toLowerCase().replace(/^lightning:/i, "");
  return `lightning:${invoice}`;
}
