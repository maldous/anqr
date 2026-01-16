/**
 * QR Data Decoding
 * Extracts and decodes data from the unmasked matrix
 */

import {
  MODE_NUMERIC,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_TERMINATOR,
  ALPHANUMERIC_CHARS,
} from './types';

// RS block configuration per version and ECC level
// Format: [[numBlocks, totalCodewords, dataCodewords], ...]
const RS_BLOCKS: Record<string, number[][][]> = {
  L: [
    [[1, 26, 19]], [[1, 44, 34]], [[1, 70, 55]], [[1, 100, 80]], [[1, 134, 108]],
    [[2, 86, 68]], [[2, 98, 78]], [[2, 121, 97]], [[2, 146, 116]], [[2, 86, 68], [2, 87, 69]],
    [[4, 101, 81]], [[2, 116, 92], [2, 117, 93]], [[4, 133, 107]], [[3, 145, 115], [1, 146, 116]],
    [[5, 109, 87], [1, 110, 88]], [[5, 122, 98], [1, 123, 99]], [[1, 135, 107], [5, 136, 108]],
    [[5, 150, 120], [1, 151, 121]], [[3, 141, 113], [4, 142, 114]], [[3, 135, 107], [5, 136, 108]],
    [[4, 144, 116], [4, 145, 117]], [[2, 139, 111], [7, 140, 112]], [[4, 151, 121], [5, 152, 122]],
    [[6, 147, 117], [4, 148, 118]], [[8, 132, 106], [4, 133, 107]], [[10, 142, 114], [2, 143, 115]],
    [[8, 152, 122], [4, 153, 123]], [[3, 147, 117], [10, 148, 118]], [[7, 146, 116], [7, 147, 117]],
    [[5, 145, 115], [10, 146, 116]], [[13, 145, 115], [3, 146, 116]], [[17, 145, 115]],
    [[17, 145, 115], [1, 146, 116]], [[13, 145, 115], [6, 146, 116]], [[12, 151, 121], [7, 152, 122]],
    [[6, 151, 121], [14, 152, 122]], [[17, 152, 122], [4, 153, 123]], [[4, 152, 122], [18, 153, 123]],
    [[20, 147, 117], [4, 148, 118]], [[19, 148, 118], [6, 149, 119]],
  ],
  M: [
    [[1, 26, 16]], [[1, 44, 28]], [[1, 70, 44]], [[2, 50, 32]], [[2, 67, 43]],
    [[4, 43, 27]], [[4, 49, 31]], [[2, 60, 38], [2, 61, 39]], [[3, 58, 36], [2, 59, 37]],
    [[4, 69, 43], [1, 70, 44]], [[1, 80, 50], [4, 81, 51]], [[6, 58, 36], [2, 59, 37]],
    [[8, 59, 37], [1, 60, 38]], [[4, 64, 40], [5, 65, 41]], [[5, 65, 41], [5, 66, 42]],
    [[7, 73, 45], [3, 74, 46]], [[10, 74, 46], [1, 75, 47]], [[9, 69, 43], [4, 70, 44]],
    [[3, 70, 44], [11, 71, 45]], [[3, 67, 41], [13, 68, 42]], [[17, 68, 42]],
    [[17, 74, 46]], [[4, 75, 47], [14, 76, 48]], [[6, 73, 45], [14, 74, 46]],
    [[8, 75, 47], [13, 76, 48]], [[19, 74, 46], [4, 75, 47]], [[22, 73, 45], [3, 74, 46]],
    [[3, 73, 45], [23, 74, 46]], [[21, 73, 45], [7, 74, 46]], [[19, 75, 47], [10, 76, 48]],
    [[2, 74, 46], [29, 75, 47]], [[10, 74, 46], [23, 75, 47]], [[14, 74, 46], [21, 75, 47]],
    [[14, 74, 46], [23, 75, 47]], [[12, 75, 47], [26, 76, 48]], [[6, 75, 47], [34, 76, 48]],
    [[29, 74, 46], [14, 75, 47]], [[13, 74, 46], [32, 75, 47]], [[40, 75, 47], [7, 76, 48]],
    [[18, 75, 47], [31, 76, 48]],
  ],
  Q: [
    [[1, 26, 13]], [[1, 44, 22]], [[2, 35, 17]], [[2, 50, 24]], [[2, 33, 15], [2, 34, 16]],
    [[4, 43, 19]], [[2, 32, 14], [4, 33, 15]], [[4, 40, 18], [2, 41, 19]], [[4, 36, 16], [4, 37, 17]],
    [[6, 43, 19], [2, 44, 20]], [[4, 50, 22], [4, 51, 23]], [[4, 46, 20], [6, 47, 21]],
    [[8, 44, 20], [4, 45, 21]], [[11, 36, 16], [5, 37, 17]], [[5, 54, 24], [7, 55, 25]],
    [[15, 43, 19], [2, 44, 20]], [[1, 50, 22], [15, 51, 23]], [[17, 50, 22], [1, 51, 23]],
    [[17, 47, 21], [4, 48, 22]], [[15, 54, 24], [5, 55, 25]], [[17, 50, 22], [6, 51, 23]],
    [[7, 54, 24], [16, 55, 25]], [[11, 54, 24], [14, 55, 25]], [[11, 54, 24], [16, 55, 25]],
    [[7, 54, 24], [22, 55, 25]], [[28, 50, 22], [6, 51, 23]], [[8, 53, 23], [26, 54, 24]],
    [[4, 54, 24], [31, 55, 25]], [[1, 53, 23], [37, 54, 24]], [[15, 54, 24], [25, 55, 25]],
    [[42, 54, 24], [1, 55, 25]], [[10, 54, 24], [35, 55, 25]], [[29, 54, 24], [19, 55, 25]],
    [[44, 54, 24], [7, 55, 25]], [[39, 54, 24], [14, 55, 25]], [[46, 54, 24], [10, 55, 25]],
    [[49, 54, 24], [10, 55, 25]], [[48, 54, 24], [14, 55, 25]], [[43, 54, 24], [22, 55, 25]],
    [[34, 54, 24], [34, 55, 25]],
  ],
  H: [
    [[1, 26, 9]], [[1, 44, 16]], [[2, 35, 13]], [[4, 25, 9]], [[2, 33, 11], [2, 34, 12]],
    [[4, 43, 15]], [[4, 39, 13], [1, 40, 14]], [[4, 40, 14], [2, 41, 15]], [[4, 36, 12], [4, 37, 13]],
    [[6, 43, 15], [2, 44, 16]], [[3, 36, 12], [8, 37, 13]], [[7, 42, 14], [4, 43, 15]],
    [[12, 33, 11], [4, 34, 12]], [[11, 36, 12], [5, 37, 13]], [[11, 36, 12], [7, 37, 13]],
    [[3, 45, 15], [13, 46, 16]], [[2, 42, 14], [17, 43, 15]], [[2, 42, 14], [19, 43, 15]],
    [[9, 39, 13], [16, 40, 14]], [[15, 43, 15], [10, 44, 16]], [[19, 46, 16], [6, 47, 17]],
    [[34, 37, 13]], [[16, 45, 15], [14, 46, 16]], [[30, 46, 16], [2, 47, 17]],
    [[22, 45, 15], [13, 46, 16]], [[33, 46, 16], [4, 47, 17]], [[12, 45, 15], [28, 46, 16]],
    [[11, 45, 15], [31, 46, 16]], [[19, 45, 15], [26, 46, 16]], [[23, 45, 15], [25, 46, 16]],
    [[23, 45, 15], [28, 46, 16]], [[19, 45, 15], [35, 46, 16]], [[11, 45, 15], [46, 46, 16]],
    [[59, 46, 16], [1, 47, 17]], [[22, 45, 15], [41, 46, 16]], [[2, 45, 15], [64, 46, 16]],
    [[24, 45, 15], [46, 46, 16]], [[42, 45, 15], [32, 46, 16]], [[10, 45, 15], [67, 46, 16]],
    [[20, 45, 15], [61, 46, 16]],
  ],
};

/**
 * Read codewords from the matrix in the QR-specified zigzag order
 */
export function readCodewords(matrix: boolean[][], moduleCount: number): number[] {
  const codewords: number[] = [];
  let currentByte = 0;
  let bitsRead = 0;

  // Start from bottom-right, move up in two-column pairs
  let up = true;
  for (let col = moduleCount - 1; col >= 1; col -= 2) {
    // Skip the timing pattern column
    if (col === 6) col = 5;

    for (let row = up ? moduleCount - 1 : 0; up ? row >= 0 : row < moduleCount; row += up ? -1 : 1) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (!isFunctionModule(row, currentCol, moduleCount)) {
          currentByte = (currentByte << 1) | (matrix[row]?.[currentCol] ? 1 : 0);
          bitsRead++;

          if (bitsRead === 8) {
            codewords.push(currentByte);
            currentByte = 0;
            bitsRead = 0;
          }
        }
      }
    }
    up = !up;
  }

  return codewords;
}

/**
 * Check if a module is a function pattern
 */
function isFunctionModule(row: number, col: number, moduleCount: number): boolean {
  const version = (moduleCount - 17) / 4;

  // Finder patterns + separators + format info
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= moduleCount - 8) return true;
  if (row >= moduleCount - 8 && col < 9) return true;

  // Timing patterns
  if (row === 6 || col === 6) return true;

  // Dark module
  if (row === moduleCount - 8 && col === 8) return true;

  // Version info (version 7+)
  if (version >= 7) {
    if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
    if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;
  }

  // Alignment patterns
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const py of positions) {
      for (const px of positions) {
        if (py < 9 && px < 9) continue;
        if (py < 9 && px >= moduleCount - 9) continue;
        if (py >= moduleCount - 9 && px < 9) continue;
        if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) return true;
      }
    }
  }

  return false;
}

const ALIGNMENT_POSITIONS: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54],
  [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74],
  [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
  [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170],
];

function getAlignmentPositions(version: number): number[] {
  if (version < 2 || version > 40) return [];
  return ALIGNMENT_POSITIONS[version - 1] || [];
}

/**
 * Separate data and error correction codewords
 */
export function separateCodewords(
  codewords: number[],
  version: number,
  eccLevel: number
): { dataCodewords: number[]; ecCodewords: number[] } {
  const eccLevelChar = ['M', 'L', 'H', 'Q'][eccLevel] as keyof typeof RS_BLOCKS;
  const rsBlocks = RS_BLOCKS[eccLevelChar]?.[version - 1];

  if (!rsBlocks) {
    return { dataCodewords: codewords, ecCodewords: [] };
  }

  // Calculate total data codewords
  let totalDataCodewords = 0;
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const dataCodewords = blockGroup[2];
    totalDataCodewords += numBlocks * dataCodewords;
  }

  return {
    dataCodewords: codewords.slice(0, totalDataCodewords),
    ecCodewords: codewords.slice(totalDataCodewords),
  };
}

/**
 * Decode the data codewords into a string
 */
export function decodeDataCodewords(dataCodewords: number[], version: number): string {
  const bits = new BitStream(dataCodewords);
  let result = '';

  while (bits.available() >= 4) {
    const mode = bits.read(4);

    if (mode === MODE_TERMINATOR) break;

    const charCountBits = getCharCountBits(mode, version);
    if (bits.available() < charCountBits) break;

    const charCount = bits.read(charCountBits);

    switch (mode) {
      case MODE_NUMERIC:
        result += decodeNumeric(bits, charCount);
        break;
      case MODE_ALPHANUMERIC:
        result += decodeAlphanumeric(bits, charCount);
        break;
      case MODE_BYTE:
        result += decodeByte(bits, charCount);
        break;
      case MODE_KANJI:
        result += decodeKanji(bits, charCount);
        break;
      default:
        // Unknown mode, try to continue
        break;
    }
  }

  return result;
}

/**
 * Get the number of bits for character count indicator
 */
function getCharCountBits(mode: number, version: number): number {
  if (version <= 9) {
    switch (mode) {
      case MODE_NUMERIC: return 10;
      case MODE_ALPHANUMERIC: return 9;
      case MODE_BYTE: return 8;
      case MODE_KANJI: return 8;
    }
  } else if (version <= 26) {
    switch (mode) {
      case MODE_NUMERIC: return 12;
      case MODE_ALPHANUMERIC: return 11;
      case MODE_BYTE: return 16;
      case MODE_KANJI: return 10;
    }
  } else {
    switch (mode) {
      case MODE_NUMERIC: return 14;
      case MODE_ALPHANUMERIC: return 13;
      case MODE_BYTE: return 16;
      case MODE_KANJI: return 12;
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
    result += value.toString().padStart(3, '0');
    remaining -= 3;
  }

  // Read remaining 2 digits (7 bits)
  if (remaining === 2 && bits.available() >= 7) {
    const value = bits.read(7);
    result += value.toString().padStart(2, '0');
  }
  // Read remaining 1 digit (4 bits)
  else if (remaining === 1 && bits.available() >= 4) {
    const value = bits.read(4);
    result += value.toString();
  }

  return result;
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
    result += ALPHANUMERIC_CHARS[c1] + ALPHANUMERIC_CHARS[c2];
    remaining -= 2;
  }

  // Read remaining character (6 bits)
  if (remaining === 1 && bits.available() >= 6) {
    const value = bits.read(6);
    result += ALPHANUMERIC_CHARS[value];
  }

  return result;
}

/**
 * Decode byte mode data
 */
function decodeByte(bits: BitStream, count: number): string {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 8) break;
    bytes.push(bits.read(8));
  }

  // Try to decode as UTF-8
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    // Fall back to ISO-8859-1
    return String.fromCharCode(...bytes);
  }
}

/**
 * Decode Kanji mode data
 */
function decodeKanji(bits: BitStream, count: number): string {
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

  // Try to decode as Shift-JIS
  try {
    return new TextDecoder('shift-jis').decode(new Uint8Array(bytes));
  } catch {
    return '';
  }
}

/**
 * Simple bit stream reader
 */
class BitStream {
  private bytes: number[];
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
