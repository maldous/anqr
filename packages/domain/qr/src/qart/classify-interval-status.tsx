import type { EncoderDerivedLayout } from "./generate.types";
export function classifyIntervalStatus(
  linearBit: number,
  encoderLayout: EncoderDerivedLayout,
): {
  isInSuffixInterval: boolean;
  isInPaddingInterval: boolean;
  isInGap: boolean;
  isInProtected: boolean;
  status: string;
} {
  const isInSuffixInterval =
    linearBit >= encoderLayout.suffixSafeStartBit && linearBit < encoderLayout.suffixSafeEndBit;
  const isInPaddingInterval =
    linearBit >= encoderLayout.paddingSafeStartBit && linearBit < encoderLayout.paddingSafeEndBit;
  const isInGap = linearBit >= encoderLayout.gapStartBit && linearBit < encoderLayout.gapEndBit;
  const isInProtected = linearBit < encoderLayout.protectedBitEnd;
  let status: string;
  if (isInSuffixInterval) status = "Vector is in SUFFIX safe interval (EXPECTED)";
  else if (isInPaddingInterval) status = "Vector is in PADDING safe interval (EXPECTED)";
  else if (isInGap) status = "Vector is in TERMINATOR GAP - BUG!";
  else if (isInProtected) status = "Vector is in PROTECTED region - BUG!";
  else status = "Vector is in UNKNOWN region - BUG!";
  return { isInSuffixInterval, isInPaddingInterval, isInGap, isInProtected, status };
}
