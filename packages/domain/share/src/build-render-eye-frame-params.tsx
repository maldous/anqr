import type { ShareConfig } from "./types";

export function buildRenderEyeFrameParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams,
): void {
  if (config.eyeOuterStyle && config.eyeOuterStyle !== "square")
    params.set("eyeOuter", config.eyeOuterStyle);
  if (config.eyeInnerStyle && config.eyeInnerStyle !== "square")
    params.set("eyeInner", config.eyeInnerStyle);
  if (config.eyeScale !== undefined && config.eyeScale !== 100)
    params.set("eyeScale", config.eyeScale.toString());
  if (config.frameStyle && config.frameStyle !== "none") params.set("frame", config.frameStyle);
  if (config.frameText) params.set("frameText", config.frameText);
}
