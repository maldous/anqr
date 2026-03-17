import type { ECCLevel } from "../../../../../../packages/domain/analyze/src/qr-analyzer/types";

export const ECC_DESCRIPTIONS: Record<ECCLevel, { recovery: string; description: string }> = {
  L: { recovery: "~7%", description: "Low - suitable for clean environments" },
  M: { recovery: "~15%", description: "Medium - balanced protection" },
  Q: { recovery: "~25%", description: "Quartile - good for logos" },
  H: { recovery: "~30%", description: "High - maximum error recovery" },
};
