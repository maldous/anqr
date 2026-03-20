import type { Canvas } from "@napi-rs/canvas";
import type { CanvasFactory } from "@/domain/render/canvas";
import {
  applyWatermarkServer,
  type ArtworkState,
  buildPngMetadata,
  buildWatermarkOpts,
  encodeOutputImage,
  loadAndPreprocessOverlay,
  loadWatermarkImage,
  scaleToOutputDimensions,
  type ServerAnimationFrame,
} from "@/domain/render/server";
import { calculateOptimalVersion } from "@/domain/qr/encode";
import { QRGenerator } from "@/domain/qr/generator";
import type { OverlayFilterOptions } from "./overlay-filter-options.types";
import { generateGifAnimationFrames, renderInitialQRCode } from "./render-runtime";
import type { ServerQRRequestParams } from "./server-qr-request-params.types";

export async function renderServerQROutput(
  p: ServerQRRequestParams,
  config: Record<string, unknown>,
  filterOptions: OverlayFilterOptions,
  canvasFactory: CanvasFactory,
): Promise<{ outputBuffer: Buffer; contentType: string }> {
  const qrGenerator = new QRGenerator(canvasFactory);
  const estimatedVersion = calculateOptimalVersion(p.data, p.ec);
  const estimatedModuleCount = estimatedVersion * 4 + 17;
  const totalMargin = p.margin + p.borderModulesExtra;

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
  if (overlayResult instanceof Response) {
    throw new TypeError("Unexpected response from loadAndPreprocessOverlay");
  }

  const { overlayCanvas, overlayFrames, hasAnimatedOverlay } = overlayResult;
  p.outputFormat = overlayResult.outputFormat as ServerQRRequestParams["outputFormat"];

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
  const { buffer, contentType } = await encodeOutputImage(
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

  return { outputBuffer: buffer, contentType };
}
