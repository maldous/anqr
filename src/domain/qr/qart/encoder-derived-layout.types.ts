import { type BitRange } from "./semantic-layout";

export interface EncoderDerivedLayout {
  bitsAfterMode: number;
  bitsAfterCharCount: number;
  bitsAfterOriginalData: number;
  bitsAfterData: number;
  bitsAfterTerminator: number;
  bitsAfterPadToByte: number;
  paddingStartByte: number;
  totalDataBytes: number;
  paddingByteCount: number;
  originalDataLength: number;
  suffixLength: number;
  suffixMode: "byte" | "numeric";
  protectedBitEnd: number;
  suffixSafeStartBit: number;
  suffixSafeEndBit: number;
  paddingSafeStartBit: number;
  paddingSafeEndBit: number;
  gapStartBit: number;
  gapEndBit: number;
  gapBitCount: number;
  allowedBitRanges: BitRange[];
  allowedBitStart: number;
  allowedBitEnd: number;
  suffixBits: number;
  paddingBits: number;
}
