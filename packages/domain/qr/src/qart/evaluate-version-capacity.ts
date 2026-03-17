import { QRMode } from "@/modules/qr-encoder/types";
import { getLengthInBits } from "../encode/utils";
import { type ECCLevel, getRSBlockInfo } from "./bit-mapping";
import { MIN_ECC_HEADROOM_BYTES } from "./min-ecc-headroom-bytes";
import { getNumericBitsForDigits } from "./get-numeric-bits-for-digits";
import { getMaxNumericDigitsForBits } from "./get-max-numeric-digits-for-bits";
import type { VersionCapacityResult } from "./version-capacity-result";

export function evaluateVersionCapacity(
  version: number,
  ecc: ECCLevel,
  dataLength: number,
  suffixMode: "numeric" | "byte",
): VersionCapacityResult | null {
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
  const totalDataBits = totalDataBytes * 8;
  const totalEccBytes = blocks.reduce((sum, b) => sum + b.eccCount, 0);

  const eccHeadroom = Math.min(MIN_ECC_HEADROOM_BYTES, Math.floor(totalEccBytes / 4));
  const usableBits = (totalDataBytes - eccHeadroom) * 8;

  const byteCharCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  const prefixLen = suffixMode === "numeric" ? dataLength : dataLength + 1;
  const prefixBits = 4 + byteCharCountBits + prefixLen * 8;
  const terminatorBits = 4;

  let actualSuffixLen: number;
  let suffixCharCount: number;
  let bitsAfterAllData: number;

  if (suffixMode === "numeric") {
    const availableForNumeric = usableBits - prefixBits - terminatorBits;
    if (availableForNumeric <= 0) return null;
    const suffixDigits = getMaxNumericDigitsForBits(availableForNumeric, version);
    if (suffixDigits <= 0) return null;
    const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
    bitsAfterAllData =
      prefixBits + 4 + numericCharCountBits + getNumericBitsForDigits(suffixDigits);
    actualSuffixLen = suffixDigits;
    suffixCharCount = suffixDigits;
  } else {
    const fixedOverhead = prefixBits + terminatorBits;
    const availableForSuffix = Math.floor((usableBits - fixedOverhead) / 8);
    if (availableForSuffix <= 0) return null;
    suffixCharCount = availableForSuffix;
    actualSuffixLen = 1 + suffixCharCount;
    bitsAfterAllData = 4 + byteCharCountBits + (prefixLen + suffixCharCount) * 8;
  }

  const protectedBits = Math.ceil(prefixBits / 8) * 8;
  const suffixSafeBits = Math.max(0, Math.floor(bitsAfterAllData / 8) * 8 - protectedBits);
  const bitsAfterTerminator = bitsAfterAllData + Math.min(4, totalDataBits - bitsAfterAllData);
  const paddingStartByte = Math.ceil(bitsAfterTerminator / 8);
  const paddingBitsVal = Math.max(0, totalDataBits - paddingStartByte * 8);
  const paddingBytes = Math.floor(paddingBitsVal / 8);
  const controllableBits = suffixSafeBits + paddingBitsVal;
  const controlPercent = (controllableBits / totalDataBits) * 100;

  return {
    totalDataBytes,
    actualSuffixLen,
    suffixCharCount,
    paddingBytes,
    suffixSafeBits,
    paddingBitsVal,
    controllableBits,
    controlPercent,
  };
}
