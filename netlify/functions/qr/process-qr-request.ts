import { QRGenerator } from "@/domain/qr/generator";
import { calculateOptimalVersion } from "@/domain/qr/encode";
import type { CanvasFactory } from "@/domain/render/canvas";
import { applyWatermarkServer } from "@/domain/render/server/apply-watermark-server";
import type { ArtworkState } from "@/domain/render/server/artwork-state.types";
import { buildPngMetadata } from "@/domain/render/server/build-png-metadata";
import { buildWatermarkOpts } from "@/domain/render/server/build-watermark-opts";
import { computeModuleSize } from "@/domain/render/server/compute-module-size";
import { encodeOutputImage } from "@/domain/render/server/encode-output-image";
import { generateGifAnimationFrames } from "@/domain/render/server/generate-gif-animation-frames";
import { loadAndPreprocessOverlay } from "@/domain/render/server/load-and-preprocess-overlay";
import { loadWatermarkImage } from "@/domain/render/server/load-watermark-image";
import { nodeCanvasFactory } from "@/domain/render/server/node-canvas-factory.const";
import { renderInitialQRCode } from "@/domain/render/server/render-initial-qr-code";
import { scaleToOutputDimensions } from "@/domain/render/server/scale-to-output-dimensions";
import type { ServerAnimationFrame } from "@/domain/render/server/server-animation-frame.types";
import { computeCacheKey } from "@/platform/node/server/compute-cache-key";
import { lookupBlobCache } from "@/platform/node/server/lookup-blob-cache";
import { qrFnLog } from "@/platform/node";
import { type Canvas } from "@napi-rs/canvas";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { buildQRGeneratorConfig } from "./build-qr-generator-config";
import { buildFilterOptionsFromParams } from "./build-filter-options-from-params";
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
