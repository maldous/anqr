import type { ShareConfig } from "./types";

export function buildQREncodingParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.encodingMode && config.encodingMode !== "auto") params.set("enc", config.encodingMode);
  if (config.maskPattern !== undefined && config.maskPattern !== "auto")
    params.set("mask", String(config.maskPattern));
  if (config.characterEncoding && config.characterEncoding !== "default")
    params.set("charset", config.characterEncoding);
  if (config.borderModulesExtra && config.borderModulesExtra !== 0)
    params.set("border", config.borderModulesExtra.toString());
  if (config.quietZoneMinEnforce === false) params.set("qzEnforce", "0");
}
