import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

export function shouldAutoNormalizeColor(config: QRGeneratorConfig): boolean {
  if (config.disableAutoSoften || config.qrFirstMode) return false;
  const scanGateProfile = config.scanGateProfile ?? "full";
  if (scanGateProfile === "off" || config.colorMode !== "color") return false;
  const overlayMode = (config.overlayMode || "").toLowerCase();
  return (
    overlayMode === "dithered" ||
    overlayMode === "blue-noise" ||
    overlayMode === "blue_noise" ||
    overlayMode === "artwork"
  );
}
