import { applyBlendMode } from "@/platform/node/server";
import { applyOverlayFiltersServer } from "@/platform/node/server";
import { applyWatermarkServer } from "@/platform/node/server";
import { blurServer } from "@/platform/node/server";
import { calculateCrc32 } from "@/platform/node/server";
import { cannyEdgeServer } from "@/platform/node/server";
import { convolveServer } from "@/platform/node/server";
import { createPngPhysChunk } from "@/platform/node/server";
import { createPngTextChunk } from "@/platform/node/server";
import { createTextWatermark } from "@/platform/node/server";
import { cropOverlayServer } from "@/platform/node/server";
import { decimateFramesToMaxCount } from "@/platform/node/server";
import { decimateFramesToMaxFps } from "@/platform/node/server";
import { embedPngMetadataAndDpi } from "@/platform/node/server";
import { encodeAnimatedGif } from "@/platform/node/server";
import { encodeAnimatedGifWithDelays } from "@/platform/node/server";
import { encodeGif } from "@/platform/node/server";
import { fetchImageAsCanvas } from "@/platform/node";
import { fetchImageWithBuffer } from "@/platform/node";
import { flipOverlayServer } from "@/platform/node/server";
import { generatePatternFramesServer } from "@/platform/node/server";
import { getWatermarkPositions } from "@/platform/node/server";
import { isGifBuffer } from "@/platform/node/server";
import { nodeCanvasFactory } from "@/platform/node/server";
import { parseGifFramesServer } from "@/platform/node/server";
import { parseGradientStops } from "./parse-gradient-stops";
import { posterizeServer } from "@/platform/node/server";
import { rgbToGrayServer } from "@/platform/node/server";
import { rotateOverlayServer } from "@/platform/node/server";
import { sharpenServer } from "@/platform/node/server";
import { sobelEdgeServer } from "@/platform/node/server";
import { thresholdServer } from "@/platform/node/server";
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
