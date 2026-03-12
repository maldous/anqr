import { createLogger } from '../../../infra/logging/logger';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isStructuralModule,
  isTimingPattern,
  isVersionInfo,
} from '../../../modules/qr-spec/index';
import {
  ALPHANUMERIC_CHARS,
  type DecodedSegmentInfo,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_ECI,
  MODE_KANJI,
  MODE_NUMERIC,
  MODE_TERMINATOR,
} from '../../../modules/qr-decoder/types';
import type { DecodedEncodingMode } from './decode.types';

export const qrDecoderLog = createLogger('DECODER');

export interface CodewordBuildState {
  currentByte: number;
  bitsRead: number;
  visitedModules: number;
  skippedAsFunction: number;
}

export function processCodewordModule(
  matrix: boolean[][],
  row: number,
  currentCol: number,
  moduleCount: number,
  version: number,
  state: CodewordBuildState,
  codewords: number[],
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  }
): void {
  state.visitedModules++;

  if (isStructuralModule(row, currentCol, moduleCount, version)) {
    state.skippedAsFunction++;
    categorizeSkippedModule(row, currentCol, moduleCount, version, skipCounts);
    return;
  }

  state.currentByte = (state.currentByte << 1) | (matrix[row]?.[currentCol] ? 1 : 0);
  state.bitsRead++;

  if (state.bitsRead === 8) {
    codewords.push(state.currentByte);
    state.currentByte = 0;
    state.bitsRead = 0;
  }
}

export function isSeparatorModule(row: number, col: number, moduleCount: number): boolean {
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}

export function categorizeSkippedModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  }
): void {
  if (isFinderPattern(row, col, moduleCount)) skipCounts.finder++;
  else if (isSeparatorModule(row, col, moduleCount)) skipCounts.separator++;
  else if (isTimingPattern(row, col, moduleCount)) skipCounts.timing++;
  else if (isFormatInfo(row, col, moduleCount)) skipCounts.format++;
  else if (isVersionInfo(row, col, moduleCount, version)) skipCounts.version++;
  else if (isAlignmentPattern(row, col, moduleCount, version)) skipCounts.alignment++;
  else if (row === moduleCount - 8 && col === 8) skipCounts.darkModule++;
  else skipCounts.other++;
}

// ALIGNMENT_POSITIONS and getAlignmentPositions imported from qr-spec

/**
 * De-interleave data codewords from multi-block QR codes.
 *
 * QR codes with multiple RS blocks interleave codewords for transmission:
 * For blocks B1, B2, ..., Bn with data [D1], [D2], ..., [Dn], the transmitted order is:
 * D1[0], D2[0], ..., Dn[0], D1[1], D2[1], ..., Dn[1], ...
 *
 * Blocks may have different sizes (some have 1 more byte than others).
 * This function reverses the interleaving to get sequential block data.
 */
function deinterleaveDataCodewords(codewords: number[], rsBlocks: number[][]): number[] {
  // Build list of blocks with their data sizes
  const blockSizes: number[] = [];
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const dataCodewords = blockGroup[2];
    for (let i = 0; i < numBlocks; i++) {
      blockSizes.push(dataCodewords);
    }
  }

  const numBlocks = blockSizes.length;

  // If only 1 block, no de-interleaving needed
  if (numBlocks <= 1) {
    return codewords;
  }

  // Find max data size (for iteration)
  const maxDataSize = Math.max(...blockSizes);

  // De-interleave: the transmitted stream has bytes interleaved round-robin
  // For each codeword position, one byte from each block (if that block has that position)
  const blockData: number[][] = blockSizes.map(() => []);
  let idx = 0;

  for (let pos = 0; pos < maxDataSize; pos++) {
    for (let b = 0; b < numBlocks; b++) {
      // Only read if this block has a byte at this position
      if (pos < blockSizes[b] && idx < codewords.length) {
        blockData[b].push(codewords[idx++]);
      }
    }
  }

  // Concatenate blocks to get sequential data
  const result = blockData.flat();

  qrDecoderLog.trace('deinterleave: De-interleaved data codewords', {
    numBlocks,
    blockSizes: blockSizes.join(','),
    inputLength: codewords.length,
    outputLength: result.length,
  });

  return result;
}

/**
 * Helper to convert mode indicator to mode name
 */
function modeToName(mode: number): DecodedSegmentInfo['modeName'] {
  switch (mode) {
    case MODE_NUMERIC:
      return 'numeric';
    case MODE_ALPHANUMERIC:
      return 'alphanumeric';
    case MODE_BYTE:
      return 'byte';
    case MODE_KANJI:
      return 'kanji';
    case MODE_ECI:
      return 'eci';
    case MODE_TERMINATOR:
      return 'terminator';
    default:
      return 'unknown';
  }
}

export interface SegmentDecodeResult {
  text: string;
  rawBytes: number[];
  outBytes: number[];
  modeTag: DecodedEncodingMode;
  valid: boolean;
}

export function decodeSegmentData(bits: BitStream, mode: number, charCount: number): SegmentDecodeResult {
  switch (mode) {
    case MODE_NUMERIC: {
      const text = decodeNumeric(bits, charCount);
      if (text.length !== charCount) {
        qrDecoderLog.debug('decode: Numeric segment truncated - decode invalid', {
          expected: charCount,
          got: text.length,
        });
      }
      const outBytes: number[] = [];
      for (let i = 0; i < text.length; i++) outBytes.push(text.codePointAt(i)! & 0xff);
      return { text, rawBytes: [], outBytes, modeTag: 'numeric', valid: text.length === charCount };
    }
    case MODE_ALPHANUMERIC: {
      const text = decodeAlphanumeric(bits, charCount);
      if (text.length !== charCount) {
        qrDecoderLog.debug('decode: Alphanumeric segment truncated - decode invalid', {
          expected: charCount,
          got: text.length,
        });
      }
      const outBytes: number[] = [];
      for (let i = 0; i < text.length; i++) outBytes.push(text.codePointAt(i)! & 0xff);
      return {
        text,
        rawBytes: [],
        outBytes,
        modeTag: 'alphanumeric',
        valid: text.length === charCount,
      };
    }
    case MODE_BYTE: {
      const r = decodeByteDetailed(bits, charCount);
      if (r.bytes.length !== charCount) {
        qrDecoderLog.debug('decode: Byte segment truncated - decode invalid', {
          expected: charCount,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'byte',
        valid: r.bytes.length === charCount,
      };
    }
    case MODE_KANJI: {
      const r = decodeKanjiDetailed(bits, charCount);
      if (r.bytes.length !== charCount * 2) {
        qrDecoderLog.debug('decode: Kanji segment truncated - decode invalid', {
          expected: charCount * 2,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'kanji',
        valid: r.bytes.length === charCount * 2,
      };
    }
    default: {
      qrDecoderLog.debug('decode: Unknown mode indicator - decode invalid', { mode });
      return { text: '', rawBytes: [], outBytes: [], modeTag: 'unknown', valid: false };
    }
  }
}

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

export function pushInvalidSegment(
  state: DecodeLoopState,
  mode: number,
  charCount: number,
  bitOffset: number
): void {
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength: 0,
    valid: false,
    bitOffset,
  });
  state.segmentIndex++;
  state.valid = false;
  if (state.primarySegmentEnded) {
    state.hasExtraSegmentsAfterPrimary = true;
  }
}

export function processDecodedSegment(
  state: DecodeLoopState,
  seg: SegmentDecodeResult,
  mode: number,
  charCount: number,
  bitOffset: number
): void {
  for (const b of seg.outBytes) state.outBytes.push(b);

  const decodedLength =
    seg.modeTag === 'kanji'
      ? seg.rawBytes.length / 2
      : seg.modeTag === 'byte'
        ? seg.rawBytes.length
        : seg.text.length;
  state.segments.push({
    index: state.segmentIndex,
    mode,
    modeName: modeToName(mode),
    charCount,
    decodedLength,
    valid: seg.valid,
    bitOffset,
  });
  state.segmentIndex++;

  if (seg.valid) {
    if (seg.modeTag !== 'unknown') {
      state.primarySegmentEnded = true;
    }
  } else {
    state.valid = false;
    if (state.primarySegmentEnded) {
      state.hasExtraSegmentsAfterPrimary = true;
    }
  }

  if (seg.modeTag !== 'unknown') state.modesSeen.add(seg.modeTag);
  state.text += seg.text;

  qrDecoderLog.trace(`decode: Decoded segment ${state.segmentIndex}`, {
    mode: seg.modeTag,
    charCount,
    textLen: seg.text.length,
    bytesLen: seg.rawBytes.length,
    segmentValid: seg.valid,
    preview: seg.text.slice(0, 50),
  });
}

export function resolveEncodingMode(modesSeen: Set<DecodedEncodingMode>): DecodedEncodingMode {
  if (modesSeen.size === 1) return modesSeen.values().next().value!;
  if (modesSeen.size > 1) return 'mixed';
  return 'unknown';
}

/**
 * Get the number of bits for character count indicator
 */
function getCharCountBits(mode: number, version: number): number {
  if (version <= 9) {
    switch (mode) {
      case MODE_NUMERIC:
        return 10;
      case MODE_ALPHANUMERIC:
        return 9;
      case MODE_BYTE:
        return 8;
      case MODE_KANJI:
        return 8;
    }
  } else if (version <= 26) {
    switch (mode) {
      case MODE_NUMERIC:
        return 12;
      case MODE_ALPHANUMERIC:
        return 11;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 10;
    }
  } else {
    switch (mode) {
      case MODE_NUMERIC:
        return 14;
      case MODE_ALPHANUMERIC:
        return 13;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 12;
    }
  }
  return 8;
}

/**
 * Decode numeric mode data
 */
function decodeNumeric(bits: BitStream, count: number): string {
  let result = '';

  // Read groups of 3 digits (10 bits each)
  let remaining = count;
  while (remaining >= 3) {
    if (bits.available() < 10) break;
    const value = bits.read(10);
    // Validate numeric value (should be 0-999)
    if (value > 999) {
      qrDecoderLog.debug('numeric: Invalid 3-digit value', { value });
      result += '???';
    } else {
      result += value.toString().padStart(3, '0');
    }
    remaining -= 3;
  }

  result += decodeNumericRemainder(bits, remaining);

  return result;
}

export function decodeNumericRemainder(bits: BitStream, remaining: number): string {
  if (remaining === 2 && bits.available() >= 7) {
    const value = bits.read(7);
    if (value > 99) {
      qrDecoderLog.debug('numeric: Invalid 2-digit value', { value });
      return '??';
    }
    return value.toString().padStart(2, '0');
  }
  if (remaining === 1 && bits.available() >= 4) {
    const value = bits.read(4);
    if (value > 9) {
      qrDecoderLog.debug('numeric: Invalid 1-digit value', { value });
      return '?';
    }
    return value.toString();
  }
  return '';
}

/**
 * Decode alphanumeric mode data
 */
function decodeAlphanumeric(bits: BitStream, count: number): string {
  let result = '';

  // Read pairs of characters (11 bits each)
  let remaining = count;
  while (remaining >= 2) {
    if (bits.available() < 11) break;
    const value = bits.read(11);
    const c1 = Math.floor(value / 45);
    const c2 = value % 45;

    // Bounds checking to prevent 'undefined' in output
    if (c1 >= 0 && c1 < ALPHANUMERIC_CHARS.length && c2 >= 0 && c2 < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[c1] + ALPHANUMERIC_CHARS[c2];
    } else {
      qrDecoderLog.debug('alphanumeric: Invalid character index', { value, c1, c2 });
      result += '??'; // Placeholder for invalid characters
    }
    remaining -= 2;
  }

  // Read remaining character (6 bits)
  if (remaining === 1 && bits.available() >= 6) {
    const value = bits.read(6);
    if (value >= 0 && value < ALPHANUMERIC_CHARS.length) {
      result += ALPHANUMERIC_CHARS[value];
    } else {
      qrDecoderLog.debug('alphanumeric: Invalid single character index', { value });
      result += '?';
    }
  }

  return result;
}

/**
 * Decode byte mode and preserve raw bytes.
 *
 * Text decoding strategy:
 * - Try UTF-8.
 * - If decoding yields replacement characters (U+FFFD), fall back to ISO-8859-1 (latin1).
 * This matches how many QR generators treat byte mode when no ECI is present.
 */
function decodeByteDetailed(bits: BitStream, count: number): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 8) break;
    bytes.push(bits.read(8));
  }

  // UTF-8 best effort
  let utf8Text = '';
  try {
    utf8Text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    utf8Text = '';
  }

  // If decoder had to replace invalid sequences, prefer a raw latin1 view.
  if (utf8Text.includes('\uFFFD')) {
    const latin1 = String.fromCodePoint(...bytes);
    return { text: latin1, bytes };
  }

  if (utf8Text.length > 0) return { text: utf8Text, bytes };

  // Fall back to ISO-8859-1
  return { text: String.fromCodePoint(...bytes), bytes };
}

/**
 * Decode Kanji mode and preserve raw bytes (Shift-JIS).
 */
function decodeKanjiDetailed(bits: BitStream, count: number): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 13) break;
    let value = bits.read(13);

    // Convert to Shift-JIS
    const byte1 = Math.floor(value / 0xc0);
    const byte2 = value % 0xc0;
    value = (byte1 << 8) | byte2;

    if (value < 0x01f00) {
      value += 0x8140;
    } else {
      value += 0xc140;
    }

    bytes.push((value >> 8) & 0xff);
    bytes.push(value & 0xff);
  }

  let text = '';
  try {
    text = new TextDecoder('shift-jis').decode(new Uint8Array(bytes));
  } catch {
    text = '';
  }

  return { text, bytes };
}

/**
 * Simple bit stream reader
 */
class BitStream {
  private readonly bytes: number[];
  private byteIndex: number = 0;
  private bitIndex: number = 0;

  constructor(bytes: number[]) {
    this.bytes = bytes;
  }

  available(): number {
    return (this.bytes.length - this.byteIndex) * 8 - this.bitIndex;
  }

  read(numBits: number): number {
    let result = 0;

    for (let i = 0; i < numBits; i++) {
      if (this.byteIndex >= this.bytes.length) return result;

      const bit = (this.bytes[this.byteIndex] >> (7 - this.bitIndex)) & 1;
      result = (result << 1) | bit;

      this.bitIndex++;
      if (this.bitIndex === 8) {
        this.bitIndex = 0;
        this.byteIndex++;
      }
    }

    return result;
  }
}

export { deinterleaveDataCodewords, modeToName, getCharCountBits, decodeNumeric, decodeAlphanumeric, decodeByteDetailed, decodeKanjiDetailed, BitStream };
export type { DecodedSegmentInfo };
