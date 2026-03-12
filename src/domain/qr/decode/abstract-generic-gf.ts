import { IllegalArgumentException } from './exceptions';
import { gfAddOrSubtract, type GFField } from './gf-field.types';

/**
 * Abstract base class for Galois Field operations
 */
export abstract class AbstractGenericGF<P = unknown> implements GFField<P> {
  protected expTable!: Int32Array;
  protected logTable!: Int32Array;

  abstract getZero(): P;
  abstract getOne(): P;
  abstract buildMonomial(degree: number, coefficient: number): P;
  abstract inverse(a: number): number;
  abstract multiply(a: number, b: number): number;
  abstract getSize(): number;
  abstract getGeneratorBase(): number;
  abstract equals(other: unknown): boolean;

  exp(a: number): number {
    return this.expTable[a];
  }

  log(a: number): number {
    if (a === 0) throw new IllegalArgumentException();
    return this.logTable[a];
  }

  static addOrSubtract(a: number, b: number): number {
    return gfAddOrSubtract(a, b);
  }
}
