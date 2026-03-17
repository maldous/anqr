import type { QRGeneratorConfig } from "@/modules/qr-generator/types";

export function resolveBinaryConfig(
  config: QRGeneratorConfig,
  forceBinary: boolean,
  effectiveFgColor: string,
  effectiveBgColor: string,
): QRGeneratorConfig {
  if (!forceBinary) return config;
  return {
    ...config,
    gradient: { type: "none", stops: [] },
    fgColor: effectiveFgColor,
    bgColor: effectiveBgColor,
  };
}
