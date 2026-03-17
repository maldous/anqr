export type RegenerateQrFn = (
  blockData: Uint8Array[],
  blockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
) => boolean[][];
