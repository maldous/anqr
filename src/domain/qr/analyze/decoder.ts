/**
 * QR Decoder - uses our own decoder (no external dependencies)
 */

import {
  disableLogBuffer,
  createLogger,
  enableLogBuffer,
  flushLogBuffer,
} from "../../../infra/logging/logger";
import { decodeQR } from "../../../modules/qr-decoder";
import { detectContentType, extractDominantColors } from "./analyzer-content";
import { analyzeColors } from "./analyze-colors";
import { analyzeQuietZone } from "./analyze-quiet-zone";
import { buildModuleMatrix } from "./build-module-matrix";
import { detectEncodingMode, stringToLatin1Bytes } from "./decoder-primitives";
import type { QRLocationCorners } from "./decoder-types";
import { validateFinderPatterns } from "./validate-finder-patterns";
import {
  buildDecodeFailure,
  buildDecoderMeta,
  buildStructuralAnalysis,
  calculateGeometryDiagnostics,
  elapsedMs,
  extractCodeFields,
  extractVersionInfo,
  formatContentTypeLabel,
} from "./decoder-helpers";
import type { QRAnalysisResult } from "../../../modules/qr-analyzer/types";

const qrAnalyzerLog = createLogger("ANALYZER");

/**
 * Decode a QR code from canvas and extract all metadata
 */
export function decodeQRFromCanvas(canvas: HTMLCanvasElement): QRAnalysisResult {
  const decodeStartMs =
    typeof globalThis.performance?.now === "function" ? globalThis.performance.now() : Date.now();

  // Enable log buffering to capture debug info for failed detections
  enableLogBuffer();

  qrAnalyzerLog.trace("decode: Starting QR decode", {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    qrAnalyzerLog.debug("decode: Could not get canvas context");
    return buildDecodeFailure("Could not get canvas context", "unknown", decodeStartMs);
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  try {
    const code = decodeQR(imageData, { inversionAttempts: "attemptBoth" });

    if (!(code?.success && code.data)) {
      qrAnalyzerLog.debug("decode: No QR code detected by our decoder");
      return buildDecodeFailure("No QR code detected in image", "no_qr_detected", decodeStartMs);
    }

    // Extract location info from our decoder
    // NOTE: location corners are the CENTERS of the 3 finder patterns
    // plus an extrapolated 4th corner (bottom-right)
    const location = code.location!;
    const geometry = calculateGeometryDiagnostics(location as QRLocationCorners);

    qrAnalyzerLog.trace("location: Finder pattern centers", {
      topLeft: location.topLeftCorner,
      topRight: location.topRightCorner,
      bottomLeft: location.bottomLeftCorner,
      bottomRight: location.bottomRightCorner,
    });

    // Calculate distances between finder pattern centers
    const topEdgeDist = Math.hypot(
      location.topRightCorner.x - location.topLeftCorner.x,
      location.topRightCorner.y - location.topLeftCorner.y,
    );
    const leftEdgeDist = Math.hypot(
      location.bottomLeftCorner.x - location.topLeftCorner.x,
      location.bottomLeftCorner.y - location.topLeftCorner.y,
    );
    const avgFinderDist = (topEdgeDist + leftEdgeDist) / 2;

    qrAnalyzerLog.trace("location: Finder pattern distances", {
      topEdge: topEdgeDist.toFixed(2),
      leftEdge: leftEdgeDist.toFixed(2),
      average: avgFinderDist.toFixed(2),
    });

    const { version, moduleCount, estimatedModulePx } = extractVersionInfo(code, avgFinderDist);

    qrAnalyzerLog.trace("detection: Module count from decoder (authoritative)", {
      moduleCount,
      version,
      estimatedModulePx: estimatedModulePx ? estimatedModulePx.toFixed(3) : "null",
      source:
        version === null ? "NOT DETECTED - will fail reproduction" : "Decoder (authoritative)",
    });

    // Warn if version not detected - reproduction will fail
    if (version === null) {
      qrAnalyzerLog.warn(
        "detection: Decoder did not provide version - reproduction will not work correctly",
      );
    }

    // Detect content type
    const type = detectContentType(code.data);
    const contentType = { type, label: formatContentTypeLabel(type) };

    // Analyze colors from the QR region
    const detectedColors = analyzeColors(imageData, location);
    const dominantColors = extractDominantColors(imageData, 3);
    qrAnalyzerLog.trace("colors: Detected colors", detectedColors);

    // Calculate quiet zone
    const quietZone = analyzeQuietZone(imageData, location, estimatedModulePx ?? 10);

    // Build module matrix if possible
    const moduleMatrix = buildModuleMatrix(
      imageData,
      location,
      moduleCount,
      estimatedModulePx ?? 10,
    );

    // Validate matrix by checking finder patterns
    if (moduleMatrix) {
      validateFinderPatterns(moduleMatrix, moduleCount);
    }

    const qrSize = avgFinderDist + 7 * (estimatedModulePx ?? 10); // Approximate full QR size

    const encodingMode = detectEncodingMode(code.data);
    const payloadBytes =
      encodingMode === "byte"
        ? stringToLatin1Bytes(code.data)
        : new TextEncoder().encode(code.data);

    // Success - flush and disable buffer (don't include debug log on success)
    flushLogBuffer();
    disableLogBuffer();

    const decoderMetadata = buildDecoderMeta(code);

    qrAnalyzerLog.trace("decoder: Complete decoder metadata (authoritative)", {
      version: decoderMetadata.version,
      maskPattern: decoderMetadata.maskPattern,
      eccLevel: decoderMetadata.eccLevel,
      errorsCorrected: decoderMetadata.errorsCorrected,
      erasures: decoderMetadata.erasures,
      numBits: decoderMetadata.numBits,
      orientation: decoderMetadata.orientation,
      hasStructuredAppend: decoderMetadata.hasStructuredAppend,
      byteSegmentCount: decoderMetadata.byteSegmentCount,
      totalByteLength: decoderMetadata.totalByteLength,
    });

    return {
      success: true,
      payload: code.data,
      payloadBytes,
      version,
      moduleCount,
      ...extractCodeFields(code),
      encodingMode,
      contentType,
      detectedColors,
      dominantColors,
      estimatedModulePx,
      quietZone,
      structuralAnalysis: buildStructuralAnalysis(version),
      imageProperties: {
        width: canvas.width,
        height: canvas.height,
        aspectRatio: Math.round((canvas.width / canvas.height) * 100) / 100,
        estimatedQrSizePx: Math.round(qrSize),
      },
      geometry,
      moduleMatrix,
      confidence: "high",
      timing: { decodeMs: elapsedMs(decodeStartMs) },
      decoderMetadata,
    };
  } catch (err) {
    qrAnalyzerLog.debug("decode: Exception during decode", { error: String(err) });
    return buildDecodeFailure(
      err instanceof Error ? err.message : "Failed to decode QR code",
      "decode_error",
      decodeStartMs,
    );
  }
}
