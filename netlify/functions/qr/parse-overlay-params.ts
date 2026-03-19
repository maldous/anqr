import type { ParsedHandlerParams } from "./parsed-handler-params.types";

export function parseOverlayParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "overlayUrl"
  | "overlayMode"
  | "overlayIntensity"
  | "colorMode"
  | "logoSize"
  | "overlayBrightness"
  | "overlayContrast"
  | "overlayGamma"
  | "overlaySaturation"
  | "overlayHueRotate"
  | "overlayInvert"
  | "overlayBlur"
  | "overlaySharpen"
  | "overlayPosterize"
  | "overlayThreshold"
  | "overlayEdgeDetect"
  | "overlayFit"
  | "overlayRotate"
  | "overlayFlipX"
  | "overlayFlipY"
  | "cropEnabled"
  | "cropX"
  | "cropY"
  | "cropSize"
  | "overlayType"
  | "overlayFramePick"
  | "gifUseFrameDelays"
  | "gifDisposalHandling"
  | "gifMaxFps"
> {
  const overlayUrl = params.get("img");
  const legacySubpixel = params.get("subpixel") === "1";
  const overlayThresholdParam = params.get("threshold");
  let defaultOverlayMode: string | undefined;
  if (legacySubpixel) defaultOverlayMode = "subpixel";
  else if (overlayUrl) defaultOverlayMode = "dithered";
  return {
    overlayUrl,
    overlayMode: params.get("mode") || defaultOverlayMode,
    overlayIntensity: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get("intensity") || "100", 10)),
    ),
    colorMode: params.get("colorMode") || "color",
    logoSize: Math.min(50, Math.max(5, Number.parseInt(params.get("logoSize") || "25", 10))),
    overlayBrightness: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get("brightness") || "0", 10)),
    ),
    overlayContrast: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get("contrast") || "0", 10)),
    ),
    overlayGamma: Math.max(0.1, Math.min(3, Number.parseFloat(params.get("gamma") || "1"))),
    overlaySaturation: Math.min(
      100,
      Math.max(-100, Number.parseInt(params.get("saturation") || "0", 10)),
    ),
    overlayHueRotate: Number.parseInt(params.get("hue") || "0", 10),
    overlayInvert: params.get("invert") === "1",
    overlayBlur: Math.max(0, Number.parseInt(params.get("blur") || "0", 10)),
    overlaySharpen: Math.max(0, Number.parseInt(params.get("sharpen") || "0", 10)),
    overlayPosterize: Math.max(0, Number.parseInt(params.get("posterize") || "0", 10)),
    overlayThreshold: overlayThresholdParam
      ? Math.min(255, Math.max(0, Number.parseInt(overlayThresholdParam, 10)))
      : undefined,
    overlayEdgeDetect: params.get("edge") || "off",
    overlayFit: params.get("fit") || "cover",
    overlayRotate: Number.parseInt(params.get("rot") || "0", 10),
    overlayFlipX: params.get("flipX") === "1",
    overlayFlipY: params.get("flipY") === "1",
    cropEnabled: params.get("cropEn") === "1",
    cropX: Number.parseFloat(params.get("cropX") || "0.5"),
    cropY: Number.parseFloat(params.get("cropY") || "0.5"),
    cropSize: Number.parseFloat(params.get("cropSize") || "1"),
    overlayType: params.get("ovType") || "static",
    overlayFramePick: params.get("ovFramePick") || "all",
    gifUseFrameDelays: params.get("gifDelays") !== "0",
    gifDisposalHandling: params.get("gifDispH") || "respect",
    gifMaxFps: Number.parseInt(params.get("gifMaxFps") || "0", 10),
  };
}
