import type { DataSegment } from "./encoder-api.types";

export function mergeAdjacentSegments(segments: DataSegment[]): DataSegment[] {
  const merged: DataSegment[] = [];
  for (const seg of segments) {
    if (merged.length > 0 && merged[merged.length - 1].mode === seg.mode) {
      merged[merged.length - 1].data += seg.data;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}
