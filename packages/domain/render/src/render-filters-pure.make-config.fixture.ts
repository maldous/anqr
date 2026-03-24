import type { QRGeneratorConfig } from "./qr-generator-shared";

export function makeConfig(overrides: Partial<QRGeneratorConfig> = {}): QRGeneratorConfig {
  return {
    colorMode: "color",
    overlayMode: "dithered",
    scanGateProfile: "full",
    ...overrides,
  } as QRGeneratorConfig;
}
