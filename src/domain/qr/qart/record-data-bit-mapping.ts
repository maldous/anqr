import type { BitPixelMapping } from './bit-mapping.types';
import { pixelToIndex } from './pixel-to-index';
import { isStructural } from './is-structural';
import type { InterleavingEntry } from './interleaving-entry';

export function recordDataBitMapping(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  totalCodewords: number,
  interleavingMap: InterleavingEntry[],
  state: { bitIndex: number; byteIndex: number },
  mappings: BitPixelMapping[]
): void {
  if (isStructural(row, col, moduleCount, version)) return;
  if (state.byteIndex >= totalCodewords) return;

  const globalBitIndex = state.byteIndex * 8 + (7 - state.bitIndex);
  const interleaveInfo = interleavingMap[state.byteIndex];

  mappings.push({
    globalBitIndex,
    byteIndex: state.byteIndex,
    bitInByte: state.bitIndex,
    row,
    col,
    isData: interleaveInfo?.isData ?? false,
    rsBlockIndex: interleaveInfo?.rsBlockIndex ?? 0,
    posInBlock: interleaveInfo?.posInBlock ?? 0,
    pixelIndex: pixelToIndex(row, col, moduleCount),
  });

  state.bitIndex -= 1;
  if (state.bitIndex === -1) {
    state.byteIndex += 1;
    state.bitIndex = 7;
  }
}
