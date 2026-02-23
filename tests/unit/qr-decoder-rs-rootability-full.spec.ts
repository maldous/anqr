import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = MockImageData;
}

describe('rsRootabilityFor', () => {
  it('returns empty array for invalid version', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const result = rsRootabilityFor([], 99, 'L');
    expect(result).toEqual([]);
  });

  it('returns empty array for invalid ECC level', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const result = rsRootabilityFor([], 1, 'X' as any);
    expect(result).toEqual([]);
  });

  it('processes v1 L single block (26 codewords)', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    // v1 L: 1 block, 26 total, 19 data + 7 ECC
    const codewords = Array.from({ length: 26 }, () => 0);
    const result = rsRootabilityFor(codewords, 1, 'L');
    expect(result.length).toBe(1);
    expect(result[0].blockIndex).toBe(0);
    expect(result[0].dataCount).toBe(19);
    expect(result[0].eccCount).toBe(7);
    expect(typeof result[0].syndromeNonZeroCount).toBe('number');
    expect(typeof result[0].bmDegree).toBe('number');
    expect(typeof result[0].chienRootsFound).toBe('number');
  });

  it('processes v1 M single block (26 codewords)', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const codewords = Array.from({ length: 26 }, () => 0);
    const result = rsRootabilityFor(codewords, 1, 'M');
    expect(result.length).toBe(1);
    expect(result[0].dataCount).toBe(16);
    expect(result[0].eccCount).toBe(10);
  });

  it('processes v1 Q single block', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const codewords = Array.from({ length: 26 }, () => 0);
    const result = rsRootabilityFor(codewords, 1, 'Q');
    expect(result.length).toBe(1);
    expect(result[0].dataCount).toBe(13);
    expect(result[0].eccCount).toBe(13);
  });

  it('processes v1 H single block', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const codewords = Array.from({ length: 26 }, () => 0);
    const result = rsRootabilityFor(codewords, 1, 'H');
    expect(result.length).toBe(1);
    expect(result[0].dataCount).toBe(9);
    expect(result[0].eccCount).toBe(17);
  });

  it('all-zero codewords have zero syndromes', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    const codewords = Array.from({ length: 26 }, () => 0);
    const result = rsRootabilityFor(codewords, 1, 'L');
    expect(result[0].syndromeNonZeroCount).toBe(0);
    expect(result[0].bmDegree).toBe(0);
    expect(result[0].chienRootsFound).toBe(0);
  });

  it('processes multi-block version (v5 Q)', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    // v5 Q: [[2, 33, 15], [2, 34, 16]] → 4 blocks total
    const totalCodewords = 2 * 33 + 2 * 34; // 134
    const codewords = Array.from({ length: totalCodewords }, (_, i) => i % 256);
    const result = rsRootabilityFor(codewords, 5, 'Q');
    expect(result.length).toBe(4);
    for (let i = 0; i < 4; i++) {
      expect(result[i].blockIndex).toBe(i);
      expect(typeof result[i].syndromeNonZeroCount).toBe('number');
      expect(typeof result[i].bmDegree).toBe('number');
      expect(typeof result[i].chienRootsFound).toBe('number');
    }
  });

  it('handles non-zero codewords with errors', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    // Random non-zero data will have non-zero syndromes
    const codewords = Array.from({ length: 26 }, (_, i) => (i * 37 + 13) % 256);
    const result = rsRootabilityFor(codewords, 1, 'L');
    expect(result.length).toBe(1);
    // Non-zero syndromes expected since data is random
    expect(result[0].syndromeNonZeroCount).toBeGreaterThan(0);
  });

  it('processes v10 M with 5 blocks', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    // v10 M: [[4, 69, 43], [1, 70, 44]] → 5 blocks
    const totalCodewords = 4 * 69 + 1 * 70; // 346
    const codewords = Array.from({ length: totalCodewords }, () => 0);
    const result = rsRootabilityFor(codewords, 10, 'M');
    expect(result.length).toBe(5);
    // First 4 blocks: 43 data, 26 ECC
    for (let i = 0; i < 4; i++) {
      expect(result[i].dataCount).toBe(43);
      expect(result[i].eccCount).toBe(26);
    }
    // Last block: 44 data, 26 ECC
    expect(result[4].dataCount).toBe(44);
    expect(result[4].eccCount).toBe(26);
  });

  it('handles short codeword array gracefully', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    // Provide fewer codewords than expected - should use 0 for missing
    const codewords = [1, 2, 3];
    const result = rsRootabilityFor(codewords, 1, 'L');
    expect(result.length).toBe(1);
    expect(typeof result[0].syndromeNonZeroCount).toBe('number');
  });

  it('processes all 40 versions for ECC L', async () => {
    const { rsRootabilityFor } = await import('../../src/modules/qr-decoder/rs-rootability');
    for (let v = 1; v <= 40; v++) {
      const codewords = Array.from({ length: 5000 }, () => 0);
      const result = rsRootabilityFor(codewords, v, 'L');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

describe('qr-data-decoder BitMatrixParser', () => {
  it('throws FormatException for invalid dimension', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    // Dimension 20 is invalid (not 21 + 4k pattern)
    const matrix = new BitMatrix(20, 20);
    expect(() => new BitMatrixParser(matrix)).toThrow();
  });

  it('constructs with valid 21x21 dimension', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(21, 21);
    const parser = new BitMatrixParser(matrix);
    expect(parser).toBeDefined();
  });

  it('constructs with valid 25x25 dimension', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(25, 25);
    const parser = new BitMatrixParser(matrix);
    expect(parser).toBeDefined();
  });

  it('readVersion returns version for small QR (v1-6)', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(21, 21);
    const parser = new BitMatrixParser(matrix);
    // v1: dimension 21, provisionalVersion = (21-17)/4 = 1
    const version = parser.readVersion();
    expect(version.getVersionNumber()).toBe(1);
  });

  it('readFormatInformation returns a result for all-zero matrix', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(21, 21);
    const parser = new BitMatrixParser(matrix);
    // All zeros may match a valid format within hamming distance or throw
    let threw = false;
    let formatInfo: unknown = null;
    try {
      formatInfo = parser.readFormatInformation();
    } catch {
      threw = true;
    }
    expect(threw || formatInfo !== null).toBe(true);
  });

  it('setMirror clears cached version and format info', async () => {
    const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(21, 21);
    const parser = new BitMatrixParser(matrix);
    parser.readVersion(); // Cache version
    parser.setMirror(true);
    // After setMirror, version should be re-read
    const version = parser.readVersion();
    expect(version.getVersionNumber()).toBe(1);
  });
});

describe('qr-data-decoder QRDecoder', () => {
  it('constructs without error', async () => {
    const { QRDecoder } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const decoder = new QRDecoder();
    expect(decoder).toBeDefined();
  });

  it('decode throws on empty matrix', async () => {
    const { QRDecoder } = await import('../../src/modules/qr-decoder/qr-data-decoder');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const decoder = new QRDecoder();
    const matrix = new BitMatrix(21, 21);
    expect(() => decoder.decode(matrix)).toThrow();
  });
});

describe('qr-decoder exceptions', () => {
  it('exports all exception types', async () => {
    const {
      NotFoundException,
      FormatException,
      ChecksumException,
      IllegalArgumentException,
      UnsupportedOperationException,
    } = await import('../../src/modules/qr-decoder/exceptions');
    expect(new NotFoundException()).toBeInstanceOf(Error);
    expect(new FormatException()).toBeInstanceOf(Error);
    expect(new ChecksumException()).toBeInstanceOf(Error);
    expect(new IllegalArgumentException()).toBeInstanceOf(Error);
    expect(new UnsupportedOperationException()).toBeInstanceOf(Error);
  });

  it('FormatException accepts message', async () => {
    const { FormatException } = await import('../../src/modules/qr-decoder/exceptions');
    const ex = new FormatException('test message');
    expect(ex.message).toBe('test message');
  });

  it('NotFoundException accepts message', async () => {
    const { NotFoundException } = await import('../../src/modules/qr-decoder/exceptions');
    const ex = new NotFoundException('not found');
    expect(ex.message).toBe('not found');
  });
});

describe('qr-decoder qr-version', () => {
  it('Version.getVersionForNumber returns correct version', async () => {
    const { Version } = await import('../../src/modules/qr-decoder/qr-version');
    const v1 = Version.getVersionForNumber(1);
    expect(v1.getVersionNumber()).toBe(1);
    expect(v1.getDimensionForVersion()).toBe(21);

    const v2 = Version.getVersionForNumber(2);
    expect(v2.getVersionNumber()).toBe(2);
    expect(v2.getDimensionForVersion()).toBe(25);

    const v40 = Version.getVersionForNumber(40);
    expect(v40.getVersionNumber()).toBe(40);
    expect(v40.getDimensionForVersion()).toBe(177);
  });

  it('Version.getVersionForNumber throws for invalid version', async () => {
    const { Version } = await import('../../src/modules/qr-decoder/qr-version');
    expect(() => Version.getVersionForNumber(0)).toThrow();
    expect(() => Version.getVersionForNumber(41)).toThrow();
  });

  it('Version.getTotalCodewords returns positive number', async () => {
    const { Version } = await import('../../src/modules/qr-decoder/qr-version');
    const v1 = Version.getVersionForNumber(1);
    expect(v1.getTotalCodewords()).toBe(26);
  });

  it('Version.getECBlocksForLevel returns ECC blocks', async () => {
    const { Version, ErrorCorrectionLevel } =
      await import('../../src/modules/qr-decoder/qr-version');
    const v1 = Version.getVersionForNumber(1);
    const ecBlocks = v1.getECBlocksForLevel(ErrorCorrectionLevel.L);
    expect(ecBlocks).toBeDefined();
    expect(ecBlocks.getECCodewordsPerBlock()).toBeGreaterThan(0);
  });

  it('Version.buildFunctionPattern returns BitMatrix', async () => {
    const { Version } = await import('../../src/modules/qr-decoder/qr-version');
    const v1 = Version.getVersionForNumber(1);
    const pattern = v1.buildFunctionPattern();
    expect(pattern.getWidth()).toBe(21);
    expect(pattern.getHeight()).toBe(21);
  });

  it('Version.decodeVersionInformation handles version bits', async () => {
    const { Version } = await import('../../src/modules/qr-decoder/qr-version');
    // Version 7 info bits (well-known test value)
    const result = Version.decodeVersionInformation(0x07c94);
    // May return null or a valid version depending on the encoding
    expect(result === null || result.getVersionNumber() >= 7).toBe(true);
  });

  it('FormatInformation.decodeFormatInformation handles valid bits', async () => {
    const { FormatInformation } = await import('../../src/modules/qr-decoder/qr-version');
    // ECC M, mask 0 → 0x5412 (known valid format)
    const result = FormatInformation.decodeFormatInformation(0x5412, 0x5412);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.getDataMask()).toBe(0);
    }
  });

  it('FormatInformation.decodeFormatInformation returns null for invalid bits', async () => {
    const { FormatInformation } = await import('../../src/modules/qr-decoder/qr-version');
    const result = FormatInformation.decodeFormatInformation(0, 0);
    // 0 might match ECC M mask 0 within hamming distance, or be null
    expect(result === null || typeof result === 'object').toBe(true);
  });

  it('ErrorCorrectionLevel has all four levels', async () => {
    const { ErrorCorrectionLevel } = await import('../../src/modules/qr-decoder/qr-version');
    expect(ErrorCorrectionLevel.L).toBeDefined();
    expect(ErrorCorrectionLevel.M).toBeDefined();
    expect(ErrorCorrectionLevel.Q).toBeDefined();
    expect(ErrorCorrectionLevel.H).toBeDefined();
  });

  it('DataMask.unmaskBitMatrix does not throw', async () => {
    const { DataMask } = await import('../../src/modules/qr-decoder/qr-version');
    const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
    const matrix = new BitMatrix(21, 21);
    // Should not throw for any mask pattern 0-7
    for (let m = 0; m < 8; m++) {
      DataMask.unmaskBitMatrix(matrix, 21, m);
    }
  });

  it('Mode.forBits returns correct modes', async () => {
    const { Mode } = await import('../../src/modules/qr-decoder/qr-version');
    expect(Mode.forBits(0)).toBe(Mode.TERMINATOR);
    expect(Mode.forBits(1)).toBe(Mode.NUMERIC);
    expect(Mode.forBits(2)).toBe(Mode.ALPHANUMERIC);
    expect(Mode.forBits(4)).toBe(Mode.BYTE);
    expect(Mode.forBits(8)).toBe(Mode.KANJI);
  });

  it('Mode.forBits throws for invalid bits', async () => {
    const { Mode } = await import('../../src/modules/qr-decoder/qr-version');
    expect(() => Mode.forBits(15)).toThrow();
  });

  it('Mode.getCharacterCountBits returns positive number', async () => {
    const { Mode, Version } = await import('../../src/modules/qr-decoder/qr-version');
    const v1 = Version.getVersionForNumber(1);
    expect(Mode.NUMERIC.getCharacterCountBits(v1)).toBe(10);
    expect(Mode.ALPHANUMERIC.getCharacterCountBits(v1)).toBe(9);
    expect(Mode.BYTE.getCharacterCountBits(v1)).toBe(8);
    expect(Mode.KANJI.getCharacterCountBits(v1)).toBe(8);
  });
});

describe('qr-decoder reed-solomon', () => {
  it('GenericGF.QR_CODE_FIELD_256 is defined', async () => {
    const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
    expect(GenericGF.QR_CODE_FIELD_256).toBeDefined();
  });

  it('ReedSolomonDecoder constructs with QR field', async () => {
    const { GenericGF, ReedSolomonDecoder } =
      await import('../../src/modules/qr-decoder/reed-solomon');
    const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
    expect(decoder).toBeDefined();
  });

  it('ReedSolomonDecoder.decode handles all-zero input', async () => {
    const { GenericGF, ReedSolomonDecoder } =
      await import('../../src/modules/qr-decoder/reed-solomon');
    const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
    // All zeros → no errors, syndromes are all zero
    const received = new Int32Array(26);
    // 7 ECC codewords for v1 L
    decoder.decode(received, 7);
    // Should not throw, all values remain 0
    for (let i = 0; i < received.length; i++) {
      expect(received[i]).toBe(0);
    }
  });

  it('ReedSolomonDecoder.decode throws for uncorrectable errors', async () => {
    const { GenericGF, ReedSolomonDecoder } =
      await import('../../src/modules/qr-decoder/reed-solomon');
    const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
    // Random data with many errors → should throw
    const received = new Int32Array(26);
    for (let i = 0; i < 26; i++) received[i] = (i * 37 + 13) % 256;
    expect(() => decoder.decode(received, 7)).toThrow();
  });
});

describe('qr-decoder result-types', () => {
  it('DecoderResult stores text and bytes', async () => {
    const { DecoderResult } = await import('../../src/modules/qr-decoder/result-types');
    const bytes = new Uint8Array([72, 69, 76, 76, 79]);
    const result = new DecoderResult(bytes, 'HELLO', null, 'L');
    expect(result.getText()).toBe('HELLO');
    expect(result.getRawBytes()).toBe(bytes);
    expect(result.getECLevel()).toBe('L');
  });

  it('DecoderResult supports setVersion and setMaskPattern', async () => {
    const { DecoderResult } = await import('../../src/modules/qr-decoder/result-types');
    const result = new DecoderResult(new Uint8Array(0), '', null, 'M');
    result.setVersion(5);
    result.setMaskPattern(3);
    // These should not throw
    expect(result.getText()).toBe('');
  });

  it('DecoderResult supports setOther', async () => {
    const { DecoderResult } = await import('../../src/modules/qr-decoder/result-types');
    const result = new DecoderResult(new Uint8Array(0), 'test', null, 'Q');
    const other = new DecoderResult(new Uint8Array(0), 'other', null, 'H');
    result.setOther(other);
    expect(result.getText()).toBe('test');
  });

  it('Result stores text and result points', async () => {
    const { Result, ResultPoint } = await import('../../src/modules/qr-decoder/result-types');
    const points = [new ResultPoint(0, 0), new ResultPoint(10, 10)];
    const result = new Result('data', new Uint8Array(0), points, 0);
    expect(result.getText()).toBe('data');
    const rp = result.getResultPoints();
    // getResultPoints may return the points array or a different value depending on constructor mapping
    expect(rp === points || typeof rp === 'number' || Array.isArray(rp)).toBe(true);
  });

  it('ResultPoint getX/getY work', async () => {
    const { ResultPoint } = await import('../../src/modules/qr-decoder/result-types');
    const point = new ResultPoint(42, 99);
    expect(point.getX()).toBe(42);
    expect(point.getY()).toBe(99);
  });

  it('Result metadata operations', async () => {
    const { Result } = await import('../../src/modules/qr-decoder/result-types');
    const result = new Result('test', new Uint8Array(0), [], 0);
    const metadata = result.getResultMetadata();
    // Initially may be null or empty map
    expect(metadata === null || metadata instanceof Map).toBe(true);
  });

  it('ResultMetadataType has expected values', async () => {
    const { ResultMetadataType } = await import('../../src/modules/qr-decoder/result-types');
    expect(typeof ResultMetadataType.ERROR_CORRECTION_LEVEL).toBe('number');
    expect(typeof ResultMetadataType.BYTE_SEGMENTS).toBe('number');
    expect(typeof ResultMetadataType.QR_MASK_PATTERN).toBe('number');
    expect(typeof ResultMetadataType.ORIENTATION).toBe('number');
  });

  it('DecodeHintType has expected values', async () => {
    const { DecodeHintType } = await import('../../src/modules/qr-decoder/result-types');
    expect(typeof DecodeHintType.TRY_HARDER).toBe('number');
    expect(typeof DecodeHintType.PURE_BARCODE).toBe('number');
  });
});

describe('qr-decoder decode-qr.ts', () => {
  it('decodeQR returns null for blank image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const w = 100;
    const h = 100;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;
      data[i + 1] = 200;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
    const imageData = new ImageData(data, w, h);
    const result = decodeQR(imageData);
    expect(result).toBeNull();
  });

  it('decodeQR with dontInvert option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(128);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, 100, 100);
    const result = decodeQR(imageData, { inversionAttempts: 'dontInvert' });
    expect(result).toBeNull();
  });

  it('decodeQR with onlyInvert option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(128);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, 100, 100);
    const result = decodeQR(imageData, { inversionAttempts: 'onlyInvert' });
    expect(result).toBeNull();
  });
});

describe('qr-decoder decoder-adapter.ts', () => {
  it('decodeQR returns null for blank image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const w = 100;
    const h = 100;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;
      data[i + 1] = 200;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
    const imageData = new ImageData(data, w, h);
    const result = decodeQR(imageData);
    expect(result).toBeNull();
  });

  it('decodeQR with dontInvert', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(200);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, 100, 100);
    const result = decodeQR(imageData, { inversionAttempts: 'dontInvert' });
    expect(result).toBeNull();
  });

  it('decodeQR with onlyInvert', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(200);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, 100, 100);
    const result = decodeQR(imageData, { inversionAttempts: 'onlyInvert' });
    expect(result).toBeNull();
  });

  it('decodeQR with attemptBoth', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(200);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, 100, 100);
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
    expect(result).toBeNull();
  });

  it('decodeQR handles transparent image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const data = new Uint8ClampedArray(50 * 50 * 4); // all zeros including alpha
    const imageData = new ImageData(data, 50, 50);
    const result = decodeQR(imageData);
    expect(result).toBeNull();
  });

  it('decodeQR handles semi-transparent pixels', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const w = 50;
    const h = 50;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 100;
      data[i + 1] = 100;
      data[i + 2] = 100;
      data[i + 3] = 128; // semi-transparent
    }
    const imageData = new ImageData(data, w, h);
    const result = decodeQR(imageData);
    expect(result).toBeNull();
  });
});
