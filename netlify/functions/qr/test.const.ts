import { applyBlendMode } from "@/domain/render/server/apply-blend-mode";
import { applyOverlayFiltersServer } from "@/domain/render/server/apply-overlay-filters-server";
import { applyWatermarkServer } from "@/domain/render/server/apply-watermark-server";
import { blurServer } from "@/domain/render/server/blur-server";
import { calculateCrc32 } from "@/domain/render/server/calculate-crc32";
import { cannyEdgeServer } from "@/domain/render/server/canny-edge-server";
import { convolveServer } from "@/domain/render/server/convolve-server";
import { createPngPhysChunk } from "@/domain/render/server/create-png-phys-chunk";
import { createPngTextChunk } from "@/domain/render/server/create-png-text-chunk";
import { createTextWatermark } from "@/domain/render/server/create-text-watermark";
import { cropOverlayServer } from "@/domain/render/server/crop-overlay-server";
import { decimateFramesToMaxCount } from "@/domain/render/server/decimate-frames-to-max-count";
import { decimateFramesToMaxFps } from "@/domain/render/server/decimate-frames-to-max-fps";
import { embedPngMetadataAndDpi } from "@/domain/render/server/embed-png-metadata-and-dpi";
import { encodeAnimatedGif } from "@/domain/render/server/encode-animated-gif";
import { encodeAnimatedGifWithDelays } from "@/domain/render/server/encode-animated-gif-with-delays";
import { encodeGif } from "@/domain/render/server/encode-gif";
import { fetchImageAsCanvas } from "@/platform/node";
import { fetchImageWithBuffer } from "@/platform/node";
import { flipOverlayServer } from "@/domain/render/server/flip-overlay-server";
import { generatePatternFramesServer } from "@/domain/render/server/generate-pattern-frames-server";
import { getWatermarkPositions } from "@/domain/render/server/get-watermark-positions";
import { isGifBuffer } from "@/domain/render/server/is-gif-buffer";
import { nodeCanvasFactory } from "@/domain/render/server/node-canvas-factory.const";
import { parseGifFramesServer } from "@/domain/render/server/parse-gif-frames-server";
import { parseGradientStops } from "./parse-gradient-stops";
import { posterizeServer } from "@/domain/render/server/posterize-server";
import { rgbToGrayServer } from "@/domain/render/server/rgb-to-gray-server";
import { rotateOverlayServer } from "@/domain/render/server/rotate-overlay-server";
import { sharpenServer } from "@/domain/render/server/sharpen-server";
import { sobelEdgeServer } from "@/domain/render/server/sobel-edge-server";
import { thresholdServer } from "@/domain/render/server/threshold-server";
import { _clearOverlayHostnameSafetyCache } from "@/platform/node/server/clear-overlay-hostname-safety-cache";
import { _isPrivateHostname } from "@/platform/node/server/is-private-hostname";
import { isPrivateOrReservedIP } from "@/platform/node/server/is-private-or-reserved-ip";

export const __test = {
  nodeCanvasFactory,
  isPrivateOrReservedIP,
  _isPrivateHostname,
  _clearOverlayHostnameSafetyCache,
  createTextWatermark,
  getWatermarkPositions,
  applyBlendMode,
  applyWatermarkServer,
  calculateCrc32,
  createPngTextChunk,
  createPngPhysChunk,
  embedPngMetadataAndDpi,
  prepareGifFramePixels,
  encodeGif,
  encodeAnimatedGif,
  generatePatternFramesServer,
  cropOverlayServer,
  rgbToGrayServer,
  convolveServer,
  blurServer,
  sharpenServer,
  posterizeServer,
  thresholdServer,
  sobelEdgeServer,
  cannyEdgeServer,
  applyOverlayFiltersServer,
  flipOverlayServer,
  rotateOverlayServer,
  isGifBuffer,
  parseGifFramesServer,
  decimateFramesToMaxFps,
  decimateFramesToMaxCount,
  encodeAnimatedGifWithDelays,
  parseGradientStops,
  fetchImageWithBuffer,
  fetchImageAsCanvas,
};
