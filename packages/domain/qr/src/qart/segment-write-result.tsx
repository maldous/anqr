export interface SegmentWriteResult {
  bitsAfterMode: number;
  bitsAfterCharCount: number;
  bitsAfterOriginalData: number;
  bitsAfterData: number;
  originalDataPreview: string;
  suffixPreview: string;
  fullDataLength: number;
}
