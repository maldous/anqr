import { qrDecoderLog } from "./qr-decoder-log";
import { modeToName } from "./mode-to-name";
import type { SegmentDecodeResult } from "./segment-decode-result";
import type { DecodeLoopState } from "./decode-loop.types";

export function processDecodedSegment(
  state: DecodeLoopState,
  seg: SegmentDecodeResult,
  mode: number,
  charCount: number,
  bitOffset: number,
): void {
  for (const b of seg.outBytes) state.outBytes.push(b);

  let decodedLength: number;
  if (seg.modeTag === "kanji") decodedLength = seg.rawBytes.length / 2;
  else if (seg.modeTag === "byte") decodedLength = seg.rawBytes.length;
  else decodedLength = seg.text.length;
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength,
    valid: seg.valid,
    bitOffset,
  });
  state.segmentIndex++;

  if (seg.valid) {
    if (seg.modeTag !== "unknown") {
      state.primarySegmentEnded = true;
    }
  } else {
    state.valid = false;
    if (state.primarySegmentEnded) {
      state.hasExtraSegmentsAfterPrimary = true;
    }
  }

  if (seg.modeTag !== "unknown") state.modesSeen.add(seg.modeTag);
  state.text += seg.text;

  qrDecoderLog.trace(`decode: Decoded segment ${state.segmentIndex}`, {
    mode: seg.modeTag,
    charCount,
    textLen: seg.text.length,
    bytesLen: seg.rawBytes.length,
    segmentValid: seg.valid,
    preview: seg.text.slice(0, 50),
  });
}
