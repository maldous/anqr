import type { ShareConfig } from "./types";
import { buildDitherBlendParams } from "./build-dither-blend-params";
import { buildDitherNoiseParams } from "./build-dither-noise-params";

export function buildDitheringParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.ditherKind && config.ditherKind !== "error_diffusion")
    params.set("ditherKind", config.ditherKind);
  if (config.diffusionKernel && config.diffusionKernel !== "floyd_steinberg")
    params.set("diffusionKernel", config.diffusionKernel);
  if (config.ditherStrength !== undefined && config.ditherStrength !== 50)
    params.set("ditherStrength", config.ditherStrength.toString());
  if (config.finderDitherStrength !== undefined && config.finderDitherStrength !== 65)
    params.set("finderDither", config.finderDitherStrength.toString());
  buildDitherBlendParams(config, params);
  if (config.ditherSerpentine) params.set("serpentine", "1");
  buildDitherNoiseParams(config, params);
}
