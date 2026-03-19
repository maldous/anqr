import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { MAX_SERVER_IMAGE_SIZE } from "./max-server-image-size.const";
import type { ECCLevel } from "./ecc-level.types";
import { parseMaskPattern } from "./parse-mask-pattern";

export function parseCoreQRParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "data"
  | "isFullRender"
  | "strictOverlay"
  | "outputWidth"
  | "outputHeight"
  | "size"
  | "fg"
  | "bg"
  | "ec"
  | "margin"
  | "transparent"
  | "encodingMode"
  | "version"
  | "maskPattern"
  | "characterEncoding"
  | "borderModulesExtra"
  | "quietZoneMinEnforce"
  | "crispEdges"
  | "pixelSnap"
  | "perModuleColorMode"
  | "contrastGuard"
  | "minContrastRatio"
  | "renderSeed"
  | "modulePxParam"
> {
  const sizeParam = Number.parseInt(params.get("size") || "400", 10);
  const modulePxParam = params.get("modulePx")
    ? Number.parseInt(params.get("modulePx")!, 10)
    : null;
  const widthParam = params.get("w") ? Number.parseInt(params.get("w")!, 10) : null;
  const heightParam = params.get("h") ? Number.parseInt(params.get("h")!, 10) : null;
  const outputWidth = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, widthParam ?? sizeParam));
  const outputHeight = Math.min(MAX_SERVER_IMAGE_SIZE, Math.max(50, heightParam ?? sizeParam));
  const size = Math.max(outputWidth, outputHeight);
  const charsetParam = params.get("charset") || "default";
  return {
    data: params.get("data") || "",
    isFullRender: params.get("_fullRender") === "1",
    strictOverlay: params.get("_strictOverlay") === "1",
    outputWidth,
    outputHeight,
    size,
    modulePxParam,
    fg: params.get("fg") || "000000",
    bg: params.get("bg") || "ffffff",
    ec: (params.get("ec")?.toUpperCase() || "H") as ECCLevel,
    margin: Math.min(20, Math.max(0, Number.parseInt(params.get("margin") || "4", 10))),
    transparent: params.get("transparent") === "1",
    encodingMode: params.get("enc") || "auto",
    version: params.get("v") ? Number.parseInt(params.get("v")!, 10) : 0,
    maskPattern: parseMaskPattern(params.get("mask")),
    characterEncoding: ["default", "utf8", "shift-jis"].includes(charsetParam)
      ? charsetParam
      : "default",
    borderModulesExtra: Math.min(10, Math.max(0, Number.parseInt(params.get("border") || "0", 10))),
    quietZoneMinEnforce: params.has("qzEnforce") ? params.get("qzEnforce") !== "0" : undefined,
    crispEdges: params.get("crisp") !== "0",
    pixelSnap: params.get("snap") || "floor",
    perModuleColorMode: params.get("modColor") || "solid",
    contrastGuard: params.get("cGuard") === "1",
    minContrastRatio: Number.parseFloat(params.get("minContrast") || "4.5"),
    renderSeed: params.get("seed") ? Number.parseInt(params.get("seed") || "0", 10) : undefined,
  };
}
