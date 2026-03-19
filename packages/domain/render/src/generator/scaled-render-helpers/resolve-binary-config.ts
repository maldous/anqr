import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

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
