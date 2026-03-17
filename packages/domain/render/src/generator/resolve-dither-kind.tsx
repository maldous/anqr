import type { QRGeneratorConfig } from "./types";

export function resolveDitherKind(config: QRGeneratorConfig): string {
  if (typeof config.ditherKind === "string" && config.ditherKind.length > 0)
    return config.ditherKind;
  if (config.ditherMode === "blue_noise") return "blue_noise";
  return "error_diffusion";
}
