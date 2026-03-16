import { MODE_TERMINATOR } from "../../../modules/qr-decoder/types";
import type { DecodedDataResult } from "./decode.types";
import { BitStream } from "./bit-stream";
import type { DecodeLoopState } from "./decode-loop-state";
import { decodeSegmentData } from "./decode-segment-data";
import { getCharCountBits } from "./get-char-count-bits";
import { processDecodedSegment } from "./process-decoded-segment";
import { pushInvalidSegment } from "./push-invalid-segment";
import { qrDecoderLog } from "./qr-decoder-log";
import { resolveEncodingMode } from "./resolve-encoding-mode";

export function decodeDataCodewordsDetailed(
  dataCodewords: number[],
  version: number,
): DecodedDataResult {
  const bits = new BitStream(dataCodewords);
  const state: DecodeLoopState = {
    text: "",
    outBytes: [],
    modesSeen: new Set(),
    segments: [],
    segmentIndex: 0,
    valid: true,
    foundTerminator: false,
    primarySegmentEnded: false,
    hasExtraSegmentsAfterPrimary: false,
  };

  qrDecoderLog.trace("decode: Starting data decode (detailed)", {
    dataCodewords: dataCodewords.length,
    version,
  });

  while (bits.available() >= 4) {
    const bitOffset = dataCodewords.length * 8 - bits.available();
    const mode = bits.read(4);

    if (mode === MODE_TERMINATOR) {
      qrDecoderLog.trace("decode: Found terminator", { segmentIndex: state.segmentIndex + 1 });
      state.segments.push({
        index: state.segmentIndex,
        mode,
        modeName: "terminator",
        charCount: 0,
        decodedLength: 0,
        valid: true,
        bitOffset,
      });
      state.segmentIndex++;
      state.foundTerminator = true;
      break;
    }

    const charCountBits = getCharCountBits(mode, version);
    if (bits.available() < charCountBits) {
      qrDecoderLog.debug("decode: Not enough bits for char count - decode invalid", {
        mode,
        charCountBits,
        available: bits.available(),
      });
      pushInvalidSegment(state, mode, -1, bitOffset);
      break;
    }

    const charCount = bits.read(charCountBits);

    if (charCount > 7000) {
      qrDecoderLog.debug("decode: Unreasonable char count, aborting - decode invalid", {
        charCount,
        mode,
      });
      pushInvalidSegment(state, mode, charCount, bitOffset);
      break;
    }

    const seg = decodeSegmentData(bits, mode, charCount);
    processDecodedSegment(state, seg, mode, charCount, bitOffset);

    if (!seg.valid) break;
  }

  const encodingMode = resolveEncodingMode(state.modesSeen);
  const structurallyValid = state.valid && !state.hasExtraSegmentsAfterPrimary;

  qrDecoderLog.trace("decode: Data decode complete", {
    valid: state.valid,
    structurallyValid,
    foundTerminator: state.foundTerminator,
    hasExtraSegmentsAfterPrimary: state.hasExtraSegmentsAfterPrimary,
    segmentCount: state.segments.length,
    segmentModes: state.segments.map((s) => s.modeName),
    textLength: state.text.length,
    bytesLength: state.outBytes.length,
    encodingMode,
  });

  return {
    text: state.text,
    bytes: new Uint8Array(state.outBytes),
    encodingMode,
    valid: state.valid,
    structurallyValid,
    segmentCount: state.segments.length,
    segments: state.segments,
  };
}
