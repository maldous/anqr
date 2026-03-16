import { QRGenerator } from "../../src/modules/qr-generator";
import { calculateOptimalVersion } from "../../src/modules/qr-encoder/encoder-api";
import { type Canvas } from "@napi-rs/canvas";
import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { computeCacheKey } from "./compute-cache-key.ts";
import { qrFnLog } from "./qr-fn-log.ts";
import { lookupBlobCache } from "./lookup-blob-cache.ts";
import { nodeCanvasFactory } from "./node-canvas-factory.const.ts";
import { computeModuleSize } from "./compute-module-size.ts";
import { buildQRGeneratorConfig } from "./build-qr-generator-config.ts";
import { buildFilterOptionsFromParams } from "./build-filter-options-from-params.ts";
import { loadAndPreprocessOverlay } from "./load-and-preprocess-overlay.ts";
import { ArtworkState } from "./artwork-state.types.ts";
import { renderInitialQRCode } from "./render-initial-qr-code.ts";
import { loadWatermarkImage } from "./load-watermark-image.ts";
import { buildWatermarkOpts } from "./build-watermark-opts.ts";
import { applyWatermarkServer } from "./apply-watermark-server.ts";
import { scaleToOutputDimensions } from "./scale-to-output-dimensions.ts";
import { buildPngMetadata } from "./build-png-metadata.ts";
import { ServerAnimationFrame } from "./server-animation-frame.types.ts";
import { generateGifAnimationFrames } from "./generate-gif-animation-frames.ts";
import { encodeOutputImage } from "./encode-output-image.ts";
import { handleCacheAndResponse } from "./handle-cache-and-response.ts";

export async function processQRRequest(
  p: ParsedHandlerParams,
  params: URLSearchParams,
  requestUrl: string,
): Promise<Response> {
  const cacheKey = computeCacheKey(params);
  qrFnLog("[BLOB] cache lookup", { cacheKey: cacheKey.slice(0, 80), skipCache: p.skipCache });
  const cachedResponse = await lookupBlobCache(cacheKey, p.skipCache);
  if (cachedResponse) return cachedResponse;

  const qrGenerator = new QRGenerator(nodeCanvasFactory);
  const estimatedVersion = calculateOptimalVersion(p.data, p.ec);
  const estimatedModuleCount = estimatedVersion * 4 + 17;
  const totalMargin = p.margin + p.borderModulesExtra;
  const moduleSize = computeModuleSize(p.modulePxParam, p.size, totalMargin, estimatedModuleCount);

  const config = buildQRGeneratorConfig(p, moduleSize);
  const filterOptions = buildFilterOptionsFromParams(p);

  const overlayResult = await loadAndPreprocessOverlay(
    p.overlayUrl,
    p.overlayMode,
    p.isFullRender,
    p.strictOverlay,
    p.explicitFormat,
    p.outputFormat,
    p.cropEnabled,
    p.cropX,
    p.cropY,
    p.cropSize,
    p.overlayRotate,
    p.overlayFlipX,
    p.overlayFlipY,
    filterOptions,
    p.gifDisposalHandling,
    p.gifMaxFps,
  );
  if (overlayResult instanceof Response) return overlayResult;
  const { overlayCanvas, overlayFrames, hasAnimatedOverlay } = overlayResult;
  p.outputFormat = overlayResult.outputFormat;

  const artworkState: ArtworkState = { lockedMask: -1, lockedVersion: p.version };
  let canvas = await renderInitialQRCode(
    p,
    config,
    overlayCanvas,
    hasAnimatedOverlay,
    artworkState,
    qrGenerator,
  );

  const watermarkImageCanvas = await loadWatermarkImage(
    p.watermarkEnabled,
    p.watermarkKind,
    p.watermarkImageUrl,
  );
  const watermarkOpts = buildWatermarkOpts(p, watermarkImageCanvas);

  if (watermarkOpts) {
    canvas = applyWatermarkServer(canvas, watermarkOpts);
  }

  const outputCanvas = scaleToOutputDimensions(canvas, p.outputWidth, p.outputHeight);

  const metadata = buildPngMetadata(
    p.metaTitle,
    p.metaAuthor,
    p.metaCopyright,
    p.metaDescription,
    p.metaLicense,
    p.metaCreationTime,
    p.metaCustomKv,
  );

  let animationFrameCanvases: Canvas[] = [];
  let animatedOverlayFrames: ServerAnimationFrame[] = [];

  if (p.outputFormat === "gif") {
    const animResult = await generateGifAnimationFrames(
      p,
      config,
      outputCanvas,
      overlayCanvas,
      overlayFrames,
      hasAnimatedOverlay,
      artworkState,
      totalMargin,
      estimatedModuleCount,
      qrGenerator,
      watermarkOpts,
    );
    animationFrameCanvases = animResult.animationFrameCanvases;
    animatedOverlayFrames = animResult.animatedOverlayFrames;
  }

  const gifBackgroundColor = p.bgOverride || `#${p.bg}`;
  const { buffer: outputBuffer, contentType } = await encodeOutputImage(
    p.outputFormat,
    animatedOverlayFrames,
    animationFrameCanvases,
    outputCanvas,
    p.gifColors,
    p.gifDisposalCode,
    gifBackgroundColor,
    p.transparent,
    p.animationSpeed,
    p.webpQuality,
    p.outputQuality,
    metadata,
    p.outputDpi,
  );

  return handleCacheAndResponse(p, outputBuffer, contentType, cacheKey, requestUrl);
}
