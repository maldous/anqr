/**
 * Interface for Galois Field operations.
 *
 * Extracted from AbstractGenericGF to break the circular dependency
 * between AbstractGenericGF ↔ GenericGFPoly.
 */
export interface GFField<P = unknown> {
  getZero(): P;
  getOne(): P;
  buildMonomial(degree: number, coefficient: number): P;
  inverse(a: number): number;
  multiply(a: number, b: number): number;
  getSize(): number;
  getGeneratorBase(): number;
  equals(other: unknown): boolean;
  exp(a: number): number;
  log(a: number): number;
}
export { gfAddOrSubtract } from './gf-add-or-subtract';
