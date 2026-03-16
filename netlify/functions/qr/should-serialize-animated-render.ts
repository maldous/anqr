import { isGifLikeImageParam } from "./is-gif-like-image-param.ts";

export function shouldSerializeAnimatedRender(params: URLSearchParams): boolean {
  const format = (params.get("format") || "").toLowerCase();
  if (format === "gif") return true;

  const overlayType = (params.get("ovType") || "").toLowerCase();
  if (overlayType === "gif") return true;

  if (isGifLikeImageParam(params.get("img"))) return true;

  const pattern1 = (params.get("animPattern") || "none").toLowerCase();
  const pattern2 = (params.get("animPattern2") || "none").toLowerCase();
  return pattern1 !== "none" || pattern2 !== "none";
}
