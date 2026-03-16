import { ParsedHandlerParams } from "./parsed-handler-params.types";
import { parseGradientStops } from "./parse-gradient-stops";

export function parseStylingParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "moduleStyle"
  | "finderStyle"
  | "eyeOuterStyle"
  | "eyeInnerStyle"
  | "eyeScale"
  | "cornerRadius"
  | "moduleGap"
  | "gapMode"
  | "dotRotationDeg"
  | "frameStyle"
  | "frameText"
  | "gradientType"
  | "gradientAngle"
  | "gradientStops"
  | "alignmentStyle"
  | "timingStyle"
  | "palette"
  | "paletteMode"
> {
  const finderStyle = params.get("finder") || "square";
  const gradientStopsParam = params.get("gradStops");
  const paletteParam = params.get("palette");
  return {
    moduleStyle: params.get("style") || "square",
    finderStyle,
    eyeOuterStyle: params.get("eyeOuter") || finderStyle,
    eyeInnerStyle: params.get("eyeInner") || finderStyle,
    eyeScale: Math.min(150, Math.max(50, Number.parseInt(params.get("eyeScale") || "100", 10))),
    cornerRadius: Math.min(100, Math.max(0, Number.parseInt(params.get("radius") || "0", 10))),
    moduleGap: Math.min(50, Math.max(0, Number.parseInt(params.get("gap") || "0", 10))),
    gapMode: params.get("gapMode") || "none",
    dotRotationDeg: Number.parseInt(params.get("dotRot") || "0", 10),
    frameStyle: params.get("frame") || "none",
    frameText: params.get("frameText") || "",
    gradientType: params.get("grad") || "none",
    gradientAngle: Number.parseInt(params.get("gradAngle") || "0", 10),
    gradientStops: gradientStopsParam ? parseGradientStops(gradientStopsParam) : undefined,
    alignmentStyle: params.get("align") || "match_finder",
    timingStyle: params.get("timing") || "match_module",
    palette: paletteParam
      ? paletteParam.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`))
      : undefined,
    paletteMode: params.get("paletteMode") || "position",
  };
}
