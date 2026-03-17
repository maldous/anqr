export interface VersionCapacityResult {
  totalDataBytes: number;
  actualSuffixLen: number;
  suffixCharCount: number;
  paddingBytes: number;
  suffixSafeBits: number;
  paddingBitsVal: number;
  controllableBits: number;
  controlPercent: number;
}
