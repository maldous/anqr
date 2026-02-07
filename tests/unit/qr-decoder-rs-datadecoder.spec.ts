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

// ImageData polyfill for node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

describe('Reed-Solomon (reed-solomon.ts)', () => {
  describe('GenericGF (Galois Field)', () => {
    it('QR_CODE_FIELD_256 has size 256 and generatorBase 0', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(field.getSize()).toBe(256);
      expect(field.getGeneratorBase()).toBe(0);
    });

    it('exp and log are inverses', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      // exp(log(x)) === x for all non-zero x
      for (let x = 1; x < 256; x++) {
        const logX = field.log(x);
        expect(field.exp(logX)).toBe(x);
      }
    });

    it('log(0) throws', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(() => field.log(0)).toThrow();
    });

    it('multiply(0, x) = 0 and multiply(x, 0) = 0', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(field.multiply(0, 42)).toBe(0);
      expect(field.multiply(42, 0)).toBe(0);
    });

    it('multiply(1, x) = x (identity)', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      for (let x = 1; x < 256; x++) {
        expect(field.multiply(1, x)).toBe(x);
      }
    });

    it('inverse(inverse(x)) = x', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      for (let x = 1; x < 256; x++) {
        expect(field.inverse(field.inverse(x))).toBe(x);
      }
    });

    it('inverse(0) throws', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(() => field.inverse(0)).toThrow();
    });

    it('x * inverse(x) = 1', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      for (let x = 1; x < 256; x++) {
        expect(field.multiply(x, field.inverse(x))).toBe(1);
      }
    });

    it('addOrSubtract is XOR', async () => {
      const { AbstractGenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      expect(AbstractGenericGF.addOrSubtract(0, 0)).toBe(0);
      expect(AbstractGenericGF.addOrSubtract(0xFF, 0xFF)).toBe(0);
      expect(AbstractGenericGF.addOrSubtract(0xAA, 0x55)).toBe(0xFF);
    });

    it('toString returns a description', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const str = field.toString();
      expect(str).toContain('GF(');
      expect(str).toContain('256');
    });

    it('equals returns true only for same instance', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(field.equals(field)).toBe(true);
      expect(field.equals(GenericGF.DATA_MATRIX_FIELD_256)).toBe(false);
      expect(field.equals(null)).toBe(false);
    });

    it('buildMonomial creates polynomial with correct degree', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const mono = field.buildMonomial(3, 5);
      expect(mono.getDegree()).toBe(3);
      expect(mono.getCoefficient(3)).toBe(5);
      expect(mono.getCoefficient(0)).toBe(0);
    });

    it('buildMonomial with coefficient 0 returns zero', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const mono = field.buildMonomial(3, 0);
      expect(mono.isZero()).toBe(true);
    });

    it('buildMonomial with negative degree throws', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(() => field.buildMonomial(-1, 5)).toThrow();
    });

    it('getZero and getOne return correct polys', async () => {
      const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(field.getZero().isZero()).toBe(true);
      expect(field.getOne().isZero()).toBe(false);
      expect(field.getOne().getCoefficient(0)).toBe(1);
    });
  });

  describe('GenericGFPoly', () => {
    it('constructor strips leading zeros', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const poly = new GenericGFPoly(field, Int32Array.from([0, 0, 0, 1, 2]));
      expect(poly.getDegree()).toBe(1);
      expect(poly.getCoefficient(1)).toBe(1);
      expect(poly.getCoefficient(0)).toBe(2);
    });

    it('all-zeros becomes degree-0 zero poly', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const poly = new GenericGFPoly(field, Int32Array.from([0, 0, 0]));
      expect(poly.isZero()).toBe(true);
      expect(poly.getDegree()).toBe(0);
    });

    it('empty coefficients throws', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      expect(() => new GenericGFPoly(field, Int32Array.from([]))).toThrow();
    });

    it('evaluateAt works correctly', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      // p(x) = 1*x + 0 = x (coefficients = [1, 0])
      const poly = new GenericGFPoly(field, Int32Array.from([1, 0]));
      expect(poly.evaluateAt(0)).toBe(0); // p(0) = 0
      expect(poly.evaluateAt(1)).toBe(1); // p(1) = 1 (sum over GF)
      expect(poly.evaluateAt(5)).toBe(5); // p(5) = 5
    });

    it('evaluateAt(1) XORs all coefficients', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const poly = new GenericGFPoly(field, Int32Array.from([3, 5, 7]));
      // evaluateAt(1) = 3 XOR 5 XOR 7 = 1
      expect(poly.evaluateAt(1)).toBe(3 ^ 5 ^ 7);
    });

    it('addOrSubtract works (XOR of coefficients)', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2, 3])); // x^2 + 2x + 3
      const b = new GenericGFPoly(field, Int32Array.from([4, 5])); // 4x + 5
      const result = a.addOrSubtract(b);
      // Result: [1, 2^4, 3^5] = [1, 6, 6]
      expect(result.getDegree()).toBe(2);
      expect(result.getCoefficient(2)).toBe(1);
      expect(result.getCoefficient(1)).toBe(2 ^ 4);
      expect(result.getCoefficient(0)).toBe(3 ^ 5);
    });

    it('addOrSubtract with zero returns other', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2]));
      const zero = field.getZero();
      expect(a.addOrSubtract(zero)).toBe(a);
      expect(zero.addOrSubtract(a)).toBe(a);
    });

    it('addOrSubtract with different field throws', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const f1 = GenericGF.QR_CODE_FIELD_256;
      const f2 = GenericGF.DATA_MATRIX_FIELD_256;
      const a = new GenericGFPoly(f1, Int32Array.from([1]));
      const b = new GenericGFPoly(f2, Int32Array.from([1]));
      expect(() => a.addOrSubtract(b)).toThrow();
    });

    it('multiply two polynomials', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      // (x + 1) * (x + 1) in GF(256)
      const a = new GenericGFPoly(field, Int32Array.from([1, 1]));
      const result = a.multiply(a);
      // x^2 + 1*x + 1*x + 1 = x^2 + 0 + 1 = x^2 + 1 (since 1 XOR 1 = 0)
      expect(result.getDegree()).toBe(2);
      expect(result.getCoefficient(2)).toBe(1);
      expect(result.getCoefficient(1)).toBe(0);
      expect(result.getCoefficient(0)).toBe(1);
    });

    it('multiply with zero returns zero', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2, 3]));
      const result = a.multiply(field.getZero());
      expect(result.isZero()).toBe(true);
    });

    it('multiplyScalar', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2]));
      // scalar 0 → zero
      expect(a.multiplyScalar(0).isZero()).toBe(true);
      // scalar 1 → same
      expect(a.multiplyScalar(1)).toBe(a);
      // scalar 2 → each coefficient multiplied by 2 in GF(256)
      const doubled = a.multiplyScalar(2);
      expect(doubled.getCoefficient(1)).toBe(field.multiply(1, 2));
      expect(doubled.getCoefficient(0)).toBe(field.multiply(2, 2));
    });

    it('multiplyByMonomial', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([3])); // constant 3
      const result = a.multiplyByMonomial(2, 1); // * x^2
      expect(result.getDegree()).toBe(2);
      expect(result.getCoefficient(2)).toBe(3);
      expect(result.getCoefficient(0)).toBe(0);
    });

    it('multiplyByMonomial with negative degree throws', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1]));
      expect(() => a.multiplyByMonomial(-1, 1)).toThrow();
    });

    it('multiplyByMonomial with coefficient 0 returns zero', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2]));
      expect(a.multiplyByMonomial(3, 0).isZero()).toBe(true);
    });

    it('divide computes quotient and remainder', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      // Divide (x^2 + 1) by (x + 1)
      const dividend = new GenericGFPoly(field, Int32Array.from([1, 0, 1]));
      const divisor = new GenericGFPoly(field, Int32Array.from([1, 1]));
      const [quotient, remainder] = dividend.divide(divisor);
      // q * d + r should equal dividend
      const reconstructed = quotient.multiply(divisor).addOrSubtract(remainder);
      // Check reconstructed equals dividend
      for (let deg = 0; deg <= dividend.getDegree(); deg++) {
        expect(reconstructed.getCoefficient(deg)).toBe(dividend.getCoefficient(deg));
      }
    });

    it('divide by zero throws', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const a = new GenericGFPoly(field, Int32Array.from([1, 2]));
      expect(() => a.divide(field.getZero())).toThrow();
    });

    it('toString produces readable representation', async () => {
      const { GenericGF, GenericGFPoly } = await import('../../src/modules/qr-decoder/reed-solomon');
      const field = GenericGF.QR_CODE_FIELD_256;
      const poly = new GenericGFPoly(field, Int32Array.from([1, 0, 1]));
      const str = poly.toString();
      expect(typeof str).toBe('string');
      expect(str.length).toBeGreaterThan(0);
    });
  });

  describe('ReedSolomonDecoder', () => {
    it('no-error codeword passes through unchanged', async () => {
      const { GenericGF, ReedSolomonDecoder } = await import('../../src/modules/qr-decoder/reed-solomon');
      const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
      // Construct a valid RS-encoded message (26 codewords, 7 EC codewords)
      // For simplicity, use all zeros which is trivially valid
      const received = new Int32Array(26);
      // No errors, should not throw
      decoder.decode(received, 7);
      // All values should still be zero
      for (const v of received) {
        expect(v).toBe(0);
      }
    });

    it('corrects a single byte error', async () => {
      const { GenericGF, GenericGFPoly, ReedSolomonDecoder } = await import(
        '../../src/modules/qr-decoder/reed-solomon'
      );
      const field = GenericGF.QR_CODE_FIELD_256;
      const decoder = new ReedSolomonDecoder(field);

      // Build a valid RS(10,4) codeword where 4 data + 6 EC
      // Use message [1, 2, 3, 4] and compute EC codewords
      // Generator polynomial for 6 EC codewords: prod_{i=0}^{5} (x - alpha^i)
      const numEC = 6;
      let generator = new GenericGFPoly(field, Int32Array.from([1]));
      for (let i = 0; i < numEC; i++) {
        const factor = new GenericGFPoly(
          field,
          Int32Array.from([1, field.exp(i + field.getGeneratorBase())])
        );
        generator = generator.multiply(factor);
      }

      // Message as polynomial
      const data = [1, 2, 3, 4];
      const msgCoeffs = new Int32Array(data.length + numEC);
      for (let i = 0; i < data.length; i++) {
        msgCoeffs[i] = data[i];
      }
      const msgPoly = new GenericGFPoly(field, msgCoeffs);
      const [, remainder] = msgPoly.divide(generator);

      // Build codeword: data followed by EC
      const codeword = new Int32Array(data.length + numEC);
      for (let i = 0; i < data.length; i++) codeword[i] = data[i];
      for (let i = 0; i <= remainder.getDegree(); i++) {
        codeword[codeword.length - 1 - i] = remainder.getCoefficient(i);
      }

      // Introduce 1 error
      const corrupted = new Int32Array(codeword);
      corrupted[2] ^= 0x55; // flip some bits in the 3rd byte

      decoder.decode(corrupted, numEC);

      // After correction, data bytes should be restored
      for (let i = 0; i < data.length; i++) {
        expect(corrupted[i]).toBe(data[i]);
      }
    });

    it('throws ReedSolomonException for too many errors', async () => {
      const { GenericGF, ReedSolomonDecoder } = await import(
        '../../src/modules/qr-decoder/reed-solomon'
      );
      const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);

      // 10 codewords, 4 EC → can correct up to 2 errors
      // Introduce 5 errors → should fail
      const received = new Int32Array(10);
      received[0] = 1;
      received[1] = 2;
      received[2] = 3;
      received[3] = 4;
      received[4] = 5;
      // All 5 data positions are "errors" against the all-zero codeword

      expect(() => decoder.decode(received, 4)).toThrow();
    });
  });
});

describe('QR Data Decoder (qr-data-decoder.ts)', () => {
  describe('BitMatrixParser', () => {
    it('throws FormatException for matrix smaller than 21', async () => {
      const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      expect(() => new BitMatrixParser(new BitMatrix(20, 20))).toThrow();
    });

    it('throws FormatException for matrix with invalid dimension parity', async () => {
      const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      // 22 & 0x03 = 2, not 1, so invalid
      expect(() => new BitMatrixParser(new BitMatrix(22, 22))).toThrow();
    });

    it('accepts valid 21x21 matrix', async () => {
      const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      const matrix = new BitMatrix(21, 21);
      // Should not throw
      const parser = new BitMatrixParser(matrix);
      expect(parser).toBeTruthy();
    });

    it('accepts valid 25x25 matrix (version 2)', async () => {
      const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      const matrix = new BitMatrix(25, 25);
      const parser = new BitMatrixParser(matrix);
      expect(parser).toBeTruthy();
    });

    it('setMirror resets cached version and format info', async () => {
      const { BitMatrixParser } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      const matrix = new BitMatrix(21, 21);
      const parser = new BitMatrixParser(matrix);
      // Should not throw
      parser.setMirror(true);
      parser.setMirror(false);
    });
  });

  describe('QRDecoder', () => {
    it('can be instantiated', async () => {
      const { QRDecoder } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const decoder = new QRDecoder();
      expect(decoder).toBeTruthy();
    });

    it('throws on invalid (blank) bit matrix', async () => {
      const { QRDecoder } = await import('../../src/modules/qr-decoder/qr-data-decoder');
      const { BitMatrix } = await import('../../src/modules/qr-decoder/bit-matrix');
      const decoder = new QRDecoder();
      const blank = new BitMatrix(21, 21);
      // Blank matrix has no valid format info → should throw
      expect(() => decoder.decode(blank)).toThrow();
    });
  });
});

describe('GenericGF static instances', () => {
  it('AZTEC and MAXICODE fields exist with correct sizes', async () => {
    const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
    expect(GenericGF.AZTEC_DATA_12.getSize()).toBe(4096);
    expect(GenericGF.AZTEC_DATA_10.getSize()).toBe(1024);
    expect(GenericGF.AZTEC_DATA_6.getSize()).toBe(64);
    expect(GenericGF.AZTEC_PARAM.getSize()).toBe(16);
    expect(GenericGF.DATA_MATRIX_FIELD_256.getSize()).toBe(256);
    expect(GenericGF.AZTEC_DATA_8).toBe(GenericGF.DATA_MATRIX_FIELD_256);
    expect(GenericGF.MAXICODE_FIELD_64).toBe(GenericGF.AZTEC_DATA_6);
  });

  it('different fields have different generator bases', async () => {
    const { GenericGF } = await import('../../src/modules/qr-decoder/reed-solomon');
    expect(GenericGF.QR_CODE_FIELD_256.getGeneratorBase()).toBe(0);
    expect(GenericGF.DATA_MATRIX_FIELD_256.getGeneratorBase()).toBe(1);
    expect(GenericGF.AZTEC_DATA_12.getGeneratorBase()).toBe(1);
  });
});
