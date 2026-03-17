import { type Canvas } from "@napi-rs/canvas";
import { OutputFormat } from "./output-format.types";
import { OverlayFilterOptions } from "./overlay-filter-options.types";
import { OverlayLoadResult } from "./overlay-load-result.types";
import { fetchImageWithBuffer } from "./fetch-image-with-buffer";
import { qrFnLog } from "./qr-fn-log";
import { CORS_HEADERS } from "./cors-headers.const";
import { hasActiveOverlayFilters } from "./has-active-overlay-filters";
import { preprocessOverlayCanvas } from "./preprocess-overlay-canvas";
import { processAnimatedGifFrames } from "./process-animated-gif-frames";

export async function loadAndPreprocessOverlay(
  overlayUrl: string | null,
  overlayMode: string | undefined,
  isFullRender: boolean,
  strictOverlay: boolean,
  explicitFormat: string | null,
  currentOutputFormat: OutputFormat,
  cropEnabled: boolean,
  cropX: number,
  cropY: number,
  cropSize: number,
  overlayRotate: number,
  overlayFlipX: boolean,
  overlayFlipY: boolean,
  filterOptions: OverlayFilterOptions,
  gifDisposalHandling: string,
  gifMaxFps: number,
): Promise<OverlayLoadResult | Response> {
  if (!overlayUrl || !overlayMode || !isFullRender) {
    return {
      overlayCanvas: null,
      overlayFrames: [],
      hasAnimatedOverlay: false,
      outputFormat: currentOutputFormat,
    };
  }

  const tOverlayFetch = Date.now();
  const fetchedImage = await fetchImageWithBuffer(overlayUrl);
  qrFnLog("[TIMING] overlay fetch", {
    url: overlayUrl.slice(0, 80),
    fetchMs: Date.now() - tOverlayFetch,
    ok: !!fetchedImage,
  });

  if (!fetchedImage) {
    if (strictOverlay) {
      return new Response("Strict overlay mode failed to fetch/decode overlay", {
        status: 502,
        headers: CORS_HEADERS,
      });
    }
    return {
      overlayCanvas: null,
      overlayFrames: [],
      hasAnimatedOverlay: false,
      outputFormat: currentOutputFormat,
    };
  }

  const strictAnimatedGif =
    strictOverlay && overlayUrl.split("?")[0].toLowerCase().endsWith(".gif");
  if (strictAnimatedGif && !fetchedImage.isAnimatedGif) {
    return new Response("Strict overlay mode expected animated GIF frames", {
      status: 502,
      headers: CORS_HEADERS,
    });
  }

  const hasFilters = hasActiveOverlayFilters(filterOptions);
  const preprocess = (c: Canvas) =>
    preprocessOverlayCanvas(
      c,
      cropEnabled,
      cropX,
      cropY,
      cropSize,
      overlayRotate,
      overlayFlipX,
      overlayFlipY,
      hasFilters,
      filterOptions,
    );

  if (fetchedImage.isAnimatedGif) {
    const outputFormat = explicitFormat ? currentOutputFormat : ("gif" as OutputFormat);
    const { overlayCanvas, overlayFrames } = processAnimatedGifFrames(
      fetchedImage,
      gifDisposalHandling,
      gifMaxFps,
      preprocess,
    );
    return { overlayCanvas, overlayFrames, hasAnimatedOverlay: true, outputFormat };
  }

  // Static overlay
  const outputFormat = explicitFormat ? currentOutputFormat : ("png" as OutputFormat);
  return {
    overlayCanvas: preprocess(fetchedImage.canvas),
    overlayFrames: [],
    hasAnimatedOverlay: false,
    outputFormat,
  };
}
