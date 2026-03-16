import { modeToName } from "./mode-to-name";
import type { DecodeLoopState } from "./decode-loop.types";

export function pushInvalidSegment(
  state: DecodeLoopState,
  mode: number,
  charCount: number,
  bitOffset: number,
): void {
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength: 0,
    valid: false,
    bitOffset,
  });
  state.segmentIndex++;
  state.valid = false;
  if (state.primarySegmentEnded) {
    state.hasExtraSegmentsAfterPrimary = true;
  }
}
