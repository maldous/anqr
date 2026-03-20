import type { OutputFormat, WatermarkBlend, WatermarkKind } from "@/contracts/generator";
import type { WatermarkPosition } from "@/platform/node/server";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { DEFAULT_OUTPUT_FORMAT } from "./default-output-format.const";
import { parseGifDisposalCode } from "./parse-gif-disposal-code";

export function parseOutputParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "explicitFormat"
  | "outputFormat"
  | "outputQuality"
  | "outputDpi"
  | "webpQuality"
  | "gifColors"
  | "maxOverlayIntensityL"
  | "maxOverlayIntensityM"
  | "maxOverlayIntensityQ"
  | "maxOverlayIntensityH"
  | "watermarkEnabled"
  | "watermarkKind"
  | "watermarkText"
  | "watermarkImageUrl"
  | "watermarkPosition"
  | "watermarkOpacity"
  | "watermarkBlend"
  | "metaTitle"
  | "metaAuthor"
  | "metaCopyright"
  | "metaDescription"
  | "metaLicense"
  | "metaCreationTime"
  | "metaCustomKv"
  | "bgOverride"
  | "formatExtra"
  | "filename"
  | "includeQuietZone"
  | "gifDisposalCode"
  | "svgShapePrecision"
  | "svgEmbedRasterOverlay"
> {
  const explicitFormat = params.get("format");
  const gifPaletteSize = params.get("gifPal");
  return {
    explicitFormat,
    outputFormat: (explicitFormat || DEFAULT_OUTPUT_FORMAT) as OutputFormat,
    outputQuality: Math.max(0, Math.min(1, Number.parseFloat(params.get("quality") || "0.9"))),
    outputDpi: Math.max(1, Math.min(1200, Number.parseInt(params.get("dpi") || "72", 10))),
    webpQuality: Math.min(100, Math.max(0, Number.parseInt(params.get("webpQ") || "90", 10))),
    gifColors: Math.min(
      256,
      Math.max(2, Number.parseInt(params.get("gifColors") || gifPaletteSize || "256", 10)),
    ),
    maxOverlayIntensityL: Number.parseInt(
      params.get("maxIntL") || params.get("maxOverlayIntensityL") || "100",
      10,
    ),
    maxOverlayIntensityM: Number.parseInt(
      params.get("maxIntM") || params.get("maxOverlayIntensityM") || "100",
      10,
    ),
    maxOverlayIntensityQ: Number.parseInt(
      params.get("maxIntQ") || params.get("maxOverlayIntensityQ") || "100",
      10,
    ),
    maxOverlayIntensityH: Number.parseInt(
      params.get("maxIntH") || params.get("maxOverlayIntensityH") || "100",
      10,
    ),
    watermarkEnabled: params.get("wmEn") === "1",
    watermarkKind: (params.get("wmKind") || "text") as WatermarkKind,
    watermarkText: params.get("wmText") || "",
    watermarkImageUrl: params.get("wmImg") || undefined,
    watermarkPosition: (params.get("wmPos") || "center") as WatermarkPosition,
    watermarkOpacity: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get("wmOpacity") || "50", 10)),
    ),
    watermarkBlend: (params.get("wmBlend") || "normal") as WatermarkBlend,
    metaTitle: params.get("metaTitle") || undefined,
    metaAuthor: params.get("metaAuthor") || undefined,
    metaCopyright: params.get("metaCopy") || undefined,
    metaDescription: params.get("metaDesc") || undefined,
    metaLicense: params.get("metaLic") || undefined,
    metaCreationTime: params.get("metaTime") === "1",
    metaCustomKv: params.get("metaKv") || undefined,
    bgOverride: params.get("bgOver") ? `#${params.get("bgOver")}` : undefined,
    formatExtra: params.get("fmtExtra") || "none",
    filename: params.get("fname") || "anqr-qrcode",
    includeQuietZone: params.get("inclQz") !== "0",
    gifDisposalCode: parseGifDisposalCode(params.get("gifDisp") || "restore_bg"),
    svgShapePrecision: params.get("svgPrec") || "pixel",
    svgEmbedRasterOverlay: params.get("svgEmbed") !== "0",
  };
}
