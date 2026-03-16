import { ParsedHandlerParams } from "./parsed-handler-params.types";
import { DEFAULT_SERVER_DITHER } from "./default-server-dither.const";
import { DitherKind } from "./dither-kind.types";

export function parseDitherParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "ditherKind"
  | "diffusionKernel"
  | "ditherStrength"
  | "finderDitherStrength"
  | "blendPreservations"
  | "blendPreservationMode"
  | "ditherSerpentine"
  | "orderedMatrix"
  | "blueNoiseTileSize"
  | "blueNoiseSeed"
  | "colorDither"
  | "subpixelGridSize"
  | "subpixelGridNum"
  | "subpixelCenterRule"
  | "subpixelNeutralColor"
  | "subpixelFinderOverride"
  | "halftoneCell"
  | "halftoneDotShape"
  | "brightnessCurve"
  | "duotoneColor1"
  | "duotoneColor2"
> {
  return {
    ditherKind: (params.get("ditherKind") || DEFAULT_SERVER_DITHER) as DitherKind,
    diffusionKernel: params.get("diffusionKernel") || "floyd_steinberg",
    ditherStrength: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get("ditherStrength") || "50", 10)),
    ),
    finderDitherStrength: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get("finderDither") || "65", 10)),
    ),
    blendPreservations: params.get("blendPres") === "1",
    blendPreservationMode: params.get("blendPresMode") === "dither" ? "dither" : "overlay",
    ditherSerpentine: params.get("serpentine") === "1",
    orderedMatrix: params.get("matrix") || "bayer4",
    blueNoiseTileSize: Number.parseInt(params.get("bnTile") || "64", 10),
    blueNoiseSeed: Number.parseInt(params.get("bnSeed") || "0", 10),
    colorDither: params.get("colorDither") || "none",
    subpixelGridSize: params.get("spGrid") || "3x3",
    subpixelGridNum: params.get("spGridNum")
      ? Number.parseInt(params.get("spGridNum") || "3", 10)
      : undefined,
    subpixelCenterRule: params.get("spCenter") || "strict",
    subpixelNeutralColor: params.get("spNeutral") ? `#${params.get("spNeutral")}` : "#808080",
    subpixelFinderOverride: params.get("spFinder") || "solid",
    halftoneCell: params.get("htCell") || "per_module",
    halftoneDotShape: params.get("htDot") || "circle",
    brightnessCurve: params.get("htCurve") || "linear",
    duotoneColor1: params.get("duo1") ? `#${params.get("duo1")}` : "#000000",
    duotoneColor2: params.get("duo2") ? `#${params.get("duo2")}` : "#ffffff",
  };
}
