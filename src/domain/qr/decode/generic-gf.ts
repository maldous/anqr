import { ArithmeticException, IllegalArgumentException } from './exceptions';
import { Integer } from './util';
import { AbstractGenericGF } from './abstract-generic-gf';
import { GenericGFPoly } from './generic-gf-poly';

/**
 * Generic Galois Field implementation
 */
export class GenericGF extends AbstractGenericGF<GenericGFPoly> {
  static readonly AZTEC_DATA_12 = new GenericGF(0x1069, 4096, 1);
  static readonly AZTEC_DATA_10 = new GenericGF(0x409, 1024, 1);
  static readonly AZTEC_DATA_6 = new GenericGF(0x43, 64, 1);
  static readonly AZTEC_PARAM = new GenericGF(0x13, 16, 1);
  static readonly QR_CODE_FIELD_256 = new GenericGF(0x011d, 256, 0);
  static readonly DATA_MATRIX_FIELD_256 = new GenericGF(0x012d, 256, 1);
  static readonly AZTEC_DATA_8 = GenericGF.DATA_MATRIX_FIELD_256;
  static readonly MAXICODE_FIELD_64 = GenericGF.AZTEC_DATA_6;

  private readonly zero: GenericGFPoly;
  private readonly one: GenericGFPoly;

  constructor(
    private readonly primitive: number,
    private readonly size: number,
    private readonly generatorBase: number
  ) {
    super();
    const expTable = new Int32Array(size);
    let x = 1;
    for (let i = 0; i < size; i++) {
      expTable[i] = x;
      x *= 2;
      if (x >= size) {
        x ^= primitive;
        x &= size - 1;
      }
    }
    this.expTable = expTable;

    const logTable = new Int32Array(size);
    for (let i = 0; i < size - 1; i++) {
      logTable[expTable[i]] = i;
    }
    this.logTable = logTable;

    this.zero = new GenericGFPoly(this, Int32Array.from([0]));
    this.one = new GenericGFPoly(this, Int32Array.from([1]));
  }

  getZero(): GenericGFPoly {
    return this.zero;
  }

  getOne(): GenericGFPoly {
    return this.one;
  }

  buildMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) throw new IllegalArgumentException();
    if (coefficient === 0) return this.zero;
    const coefficients = new Int32Array(degree + 1);
    coefficients[0] = coefficient;
    return new GenericGFPoly(this, coefficients);
  }

  inverse(a: number): number {
    if (a === 0) throw new ArithmeticException();
    return this.expTable[this.size - this.logTable[a] - 1];
  }

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
  }

  getSize(): number {
    return this.size;
  }

  getGeneratorBase(): number {
    return this.generatorBase;
  }

  toString(): string {
    return `GF(0x${Integer.toHexString(this.primitive)},${this.size})`;
  }

  equals(o: any): boolean {
    return o === this;
  }
}
