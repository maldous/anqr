// Canonical public API for @anqr/application-generator
export * from "./generation/generation-singleton";
export * from "./export/download-animated-gif-format.service";
export * from "./export/download-svg-format.service";
export * from "./frames/execute-frame-generation-loop.service";
export * from "./qart/run-q-art-generation.service";
export * from "./safety/compute-safety-adjustments.service";
export * from "./hooks/useQRGenerator";
export { applyTierAndPayloadParams } from "./url-import/apply-payload-params";
export { applyQrEncodingParams } from "./url-import/apply-encoding-params";
export {
  applyDitheringParams,
  applyEccIntensityLimits,
  applyRenderBasicStyles,
  applyRenderColorAndPaletteStyles,
  applyRenderEyeAndFrameStyles,
  applySubpixelAndHalftoneParams,
} from "./url-import/apply-render-params";
export {
  applyOverlayAdvancedParams,
  applyOverlayPreprocessingParams,
  applyOverlayTransformParams,
  applyWatermarkParams,
} from "./url-import/apply-overlay-params";
export {
  applyAnimationBasicParams,
  applyAnimationPatternParams,
  applyMetadataParams,
  applyOutputAdvancedParams,
  applyOutputBasicParams,
  applyQaAndAutoParams,
  applySafetyParams,
} from "./url-import/apply-animation-output-and-safety-params";
export type { UrlImportStore } from "./url-import/store-contract.types";
