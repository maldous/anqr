import type { QRGeneratorConfig } from "@/modules/qr-generator/types";
import type { ScaledPreserveFlags } from "../scaled-render-types";

export function buildScaledPreserveFlags(config: QRGeneratorConfig): ScaledPreserveFlags {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  return {
    preserveFinders: config.preserveFinders !== false,
    preserveTiming: preserveFunctional
      ? config.preserveTiming !== false
      : config.preserveTiming === true,
    preserveAlignment: preserveFunctional
      ? config.preserveAlignment !== false
      : config.preserveAlignment === true,
    protectFormat: preserveFunctional
      ? config.protectFormatInfo !== false
      : config.protectFormatInfo === true,
    protectVersion: preserveFunctional
      ? config.protectVersionInfo !== false
      : config.protectVersionInfo === true,
    preserveFixedDark: preserveFunctional,
  };
}
