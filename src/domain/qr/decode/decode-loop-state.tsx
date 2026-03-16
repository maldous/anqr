import type { DecodedSegmentInfo } from "../../../modules/qr-decoder/types";
import type { DecodedEncodingMode } from "./decode.types";

export interface DecodeLoopState {
  text: string;
  outBytes: number[];
  modesSeen: Set<DecodedEncodingMode>;
  segments: DecodedSegmentInfo[];
  segmentIndex: number;
  valid: boolean;
  foundTerminator: boolean;
  primarySegmentEnded: boolean;
  hasExtraSegmentsAfterPrimary: boolean;
}
