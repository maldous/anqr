import { decodeDataCodewordsDetailed, RS_BLOCKS } from "./decode";
import { attemptRSCorrectionWithFallback } from "./attempt-rs-correction-with-fallback";
import { collectAlignmentDiagnostics } from "./collect-alignment-diagnostics";
import { collectTimingDiagnostics } from "./collect-timing-diagnostics";
import { calculateLocation, extractModuleMatrix } from "./extract";
import { getECCLevelChar, readFormatInfo } from "./format";
import { findFinderPatterns, selectFinderPatterns } from "./locate";
import { runMaskRootabilitySweep } from "./run-mask-rootability-sweep";
import type { DecodeResult } from "../../../modules/qr-decoder/types";
import { qrDecoderLog } from "./decoder-log";

export function tryDecode(imageData: ImageData): DecodeResult | null {
  try {
    qrDecoderLog.trace("main: Starting decode attempt", {
      width: imageData.width,
      height: imageData.height,
    });
    const { patterns, threshold } = findFinderPatterns(imageData);
    if (patterns.length < 3) {
      qrDecoderLog.trace("main: Failed - not enough finder patterns", { found: patterns.length });
      return null;
    }
    const selected = selectFinderPatterns(patterns);
    if (!selected) {
      qrDecoderLog.trace("main: Failed - could not select valid pattern triplet");
      return null;
    }
    const [topLeft, topRight, bottomLeft] = selected;
    const location = calculateLocation(topLeft, topRight, bottomLeft);
    const version = (location.moduleCount - 17) / 4;
    qrDecoderLog.trace("main: Calculated version", { version, moduleCount: location.moduleCount });
    const rawMatrix = extractModuleMatrix(imageData, location, threshold);
    const formatInfo = readFormatInfo(rawMatrix, location.moduleCount);
    if (!formatInfo) {
      qrDecoderLog.trace("main: Failed - could not read format info");
      return null;
    }
    const moduleCount = location.moduleCount;
    const versionRounded = Math.round(version);
    collectTimingDiagnostics(rawMatrix, moduleCount);
    collectAlignmentDiagnostics(rawMatrix, moduleCount, versionRounded);
    runMaskRootabilitySweep(
      rawMatrix,
      moduleCount,
      versionRounded,
      getECCLevelChar(formatInfo.eccLevel),
    );
    const eccChar = getECCLevelChar(formatInfo.eccLevel) as keyof typeof RS_BLOCKS;
    const rsBlocks = RS_BLOCKS[eccChar]?.[versionRounded - 1];
    if (!rsBlocks) return null;
    const correctionResult = attemptRSCorrectionWithFallback(
      rawMatrix,
      moduleCount,
      rsBlocks,
      formatInfo.maskPattern,
    );
    if (!correctionResult) return null;
    const {
      rsResult: { dataCodewords },
      usedMask,
    } = correctionResult;
    const decoded = decodeDataCodewordsDetailed(dataCodewords, versionRounded);
    if (!decoded.valid || !decoded.text) return null;
    return {
      success: true,
      data: decoded.text,
      dataBytes: decoded.bytes,
      encodingMode: decoded.encodingMode,
      error: null,
      location: {
        topLeftCorner: topLeft.center,
        topRightCorner: topRight.center,
        bottomLeftCorner: bottomLeft.center,
        bottomRightCorner: location.bottomRight,
      },
      version: versionRounded,
      eccLevel: getECCLevelChar(formatInfo.eccLevel),
      maskPattern: usedMask,
      structurallyValid: decoded.structurallyValid,
      segmentCount: decoded.segmentCount,
      segments: decoded.segments,
    };
  } catch (err) {
    qrDecoderLog.trace("main: Exception during decode", { error: String(err) });
    return null;
  }
}
