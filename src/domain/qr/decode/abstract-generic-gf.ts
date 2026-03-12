import { IllegalArgumentException } from './exceptions';
import type { GenericGFPoly } from './generic-gf-poly';

/**
 * Abstract base class for Galois Field operations
 */
export abstract class AbstractGenericGF {
  protected expTable!: Int32Array;
  protected logTable!: Int32Array;

  abstract getZero(): GenericGFPoly;
  abstract getOne(): GenericGFPoly;
  abstract buildMonomial(degree: number, coefficient: number): GenericGFPoly;
  abstract inverse(a: number): number;
  abstract multiply(a: number, b: number): number;
  abstract getSize(): number;
  abstract getGeneratorBase(): number;
  abstract equals(other: any): boolean;

  exp(a: number): number {
    return this.expTable[a];
  }

  log(a: number): number {
    if (a === 0) throw new IllegalArgumentException();
    return this.logTable[a];
  }

  static addOrSubtract(a: number, b: number): number {
    return a ^ b;
  }
}
