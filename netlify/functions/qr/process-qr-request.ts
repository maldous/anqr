import { QRGenerator } from "@/modules/qr-generator";
import { calculateOptimalVersion } from "@/modules/qr-encoder";
import type { CanvasFactory } from "@/domain/render/canvas-factory.types";
import { type Canvas } from "@napi-rs/canvas";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { computeCacheKey } from "./compute-cache-key";
import { qrFnLog } from "./qr-fn-log";
import { lookupBlobCache } from "./lookup-blob-cache";
import { nodeCanvasFactory } from "./node-canvas-factory.const";
import { computeModuleSize } from "./compute-module-size";
import { buildQRGeneratorConfig } from "./build-qr-generator-config";
import { buildFilterOptionsFromParams } from "./build-filter-options-from-params";
import { loadAndPreprocessOverlay } from "./load-and-preprocess-overlay";
import type { ArtworkState } from "./artwork-state.types";
import { renderInitialQRCode } from "./render-initial-qr-code";
import { loadWatermarkImage } from "./load-watermark-image";
import { buildWatermarkOpts } from "./build-watermark-opts";
import { applyWatermarkServer } from "./apply-watermark-server";
import { scaleToOutputDimensions } from "./scale-to-output-dimensions";
import { buildPngMetadata } from "./build-png-metadata";
import type { ServerAnimationFrame } from "./server-animation-frame.types";
import { generateGifAnimationFrames } from "./generate-gif-animation-frames";
import { encodeOutputImage } from "./encode-output-image";
import { handleCacheAndResponse } from "./handle-cache-and-response";

export async function processQRRequest(
  p: ParsedHandlerParams,
  params: URLSearchParams,
  requestUrl: string,
): Promise<Response> {
  const cacheKey = computeCacheKey(params);
  qrFnLog("[BLOB] cache lookup", { cacheKey: cacheKey.slice(0, 80), skipCache: p.skipCache });
  const cachedResponse = await lookupBlobCache(cacheKey, p.skipCache);
  if (cachedResponse) return cachedResponse;

  const qrGenerator = new QRGenerator(nodeCanvasFactory as unknown as CanvasFactory);
  const estimatedVersion = calculateOptimalVersion(p.data, p.ec);
  const estimatedModuleCount = estimatedVersion * 4 + 17;
  const totalMargin = p.margin + p.borderModulesExtra;
  const moduleSize = computeModuleSize(
    p.modulePxParam ?? undefined,
    p.size,
    totalMargin,
    estimatedModuleCount,
  );

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
