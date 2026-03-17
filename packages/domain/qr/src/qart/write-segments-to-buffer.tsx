import { qrBitBuffer } from "../encode/bit-buffer";
import { qr8BitByte, qrNumber } from "../encode/data-modes";
import { getLengthInBits } from "../encode/utils";
import type { QArtEncodingPlan } from "./q-art-encoding-plan";
import type { SegmentWriteResult } from "./segment-write-result";

export function writeSegmentsToBuffer(
  plan: QArtEncodingPlan,
  buffer: ReturnType<typeof qrBitBuffer>,
  version: number,
): SegmentWriteResult {
  if (plan.mode === "numeric") {
    const prefixSegment = qr8BitByte(plan.prefix);
    buffer.put(prefixSegment.getMode(), 4);
    const bitsAfterMode = buffer.getLengthInBits();
    buffer.put(prefixSegment.getLength(), getLengthInBits(prefixSegment.getMode(), version));
    const bitsAfterCharCount = buffer.getLengthInBits();
    prefixSegment.write(buffer);
    const bitsAfterOriginalData = buffer.getLengthInBits();

    if (plan.suffix.length > 0) {
      const suffixSegment = qrNumber(plan.suffix);
      buffer.put(suffixSegment.getMode(), 4);
      buffer.put(suffixSegment.getLength(), getLengthInBits(suffixSegment.getMode(), version));
      suffixSegment.write(buffer);
    }

    return {
      bitsAfterMode,
      bitsAfterCharCount,
      bitsAfterOriginalData,
      bitsAfterData: buffer.getLengthInBits(),
      originalDataPreview:
        plan.prefix.slice(0, Math.min(60, plan.prefix.length)) +
        (plan.prefix.length > 60 ? "..." : ""),
      suffixPreview: plan.suffix.slice(0, 20) + (plan.suffix.length > 20 ? "..." : ""),
      fullDataLength: plan.prefix.length + plan.suffix.length,
    };
  }

  const segment = qr8BitByte(plan.fullData);
  buffer.put(segment.getMode(), 4);
  const bitsAfterMode = buffer.getLengthInBits();
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  const bitsAfterCharCount = buffer.getLengthInBits();
  const bitsAfterOriginalData = bitsAfterCharCount + plan.originalDataLength * 8;
  segment.write(buffer);

  return {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData: buffer.getLengthInBits(),
    originalDataPreview:
      plan.fullData.slice(0, Math.min(60, plan.originalDataLength)) +
      (plan.originalDataLength > 60 ? "..." : ""),
    suffixPreview:
      plan.fullData.slice(plan.originalDataLength, plan.originalDataLength + 20) +
      (plan.fullData.length - plan.originalDataLength > 20 ? "..." : ""),
    fullDataLength: plan.fullData.length,
  };
}
