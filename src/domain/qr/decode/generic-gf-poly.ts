import { IllegalArgumentException } from './exceptions';
import { arraycopy } from './util';
import { AbstractGenericGF } from './abstract-generic-gf';
import { formatPolyTerm } from './format-poly-term';

/**
 * Polynomial over a Galois Field
 */
export class GenericGFPoly {
  private readonly field: AbstractGenericGF;
  private readonly coefficients: Int32Array;

  constructor(field: AbstractGenericGF, coefficients: Int32Array) {
    if (coefficients.length === 0) throw new IllegalArgumentException();
    this.field = field;
    const coefficientsLength = coefficients.length;
    if (coefficientsLength > 1 && coefficients[0] === 0) {
      let firstNonZero = 1;
      while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) firstNonZero++;
      if (firstNonZero === coefficientsLength) {
        this.coefficients = Int32Array.from([0]);
      } else {
        this.coefficients = new Int32Array(coefficientsLength - firstNonZero);
        arraycopy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
      }
    } else {
      this.coefficients = coefficients;
    }
  }

  getCoefficients(): Int32Array {
    return this.coefficients;
  }

  getDegree(): number {
    return this.coefficients.length - 1;
  }

  isZero(): boolean {
    return this.coefficients[0] === 0;
  }

  getCoefficient(degree: number): number {
    return this.coefficients[this.coefficients.length - 1 - degree];
  }

  evaluateAt(a: number): number {
    if (a === 0) return this.getCoefficient(0);
    const coefficients = this.coefficients;
    let result: number;
    if (a === 1) {
      result = 0;
      for (const coefficient of coefficients) {
        result = AbstractGenericGF.addOrSubtract(result, coefficient);
      }
      return result;
    }
    result = coefficients[0];
    const size = coefficients.length;
    for (let i = 1; i < size; i++) {
      result = AbstractGenericGF.addOrSubtract(this.field.multiply(a, result), coefficients[i]);
    }
    return result;
  }

  addOrSubtract(other: GenericGFPoly): GenericGFPoly {
    if (!this.field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }
    if (this.isZero()) return other;
    if (other.isZero()) return this;

    let smallerCoefficients = this.coefficients;
    let largerCoefficients = other.coefficients;
    if (smallerCoefficients.length > largerCoefficients.length) {
      const temp = smallerCoefficients;
      smallerCoefficients = largerCoefficients;
      largerCoefficients = temp;
    }
    const sumDiff = new Int32Array(largerCoefficients.length);
    const lengthDiff = largerCoefficients.length - smallerCoefficients.length;
    arraycopy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
    for (let i = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = AbstractGenericGF.addOrSubtract(
        smallerCoefficients[i - lengthDiff],
        largerCoefficients[i]
      );
    }
    return new GenericGFPoly(this.field, sumDiff);
  }

  multiply(other: GenericGFPoly): GenericGFPoly {
    if (!this.field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }
    if (this.isZero() || other.isZero()) return this.field.getZero();
    const aCoefficients = this.coefficients;
    const aLength = aCoefficients.length;
    const bCoefficients = other.coefficients;
    const bLength = bCoefficients.length;
    const product = new Int32Array(aLength + bLength - 1);
    for (let i = 0; i < aLength; i++) {
      const aCoeff = aCoefficients[i];
      for (let j = 0; j < bLength; j++) {
        product[i + j] = AbstractGenericGF.addOrSubtract(
          product[i + j],
          this.field.multiply(aCoeff, bCoefficients[j])
        );
      }
    }
    return new GenericGFPoly(this.field, product);
  }

  multiplyScalar(scalar: number): GenericGFPoly {
    if (scalar === 0) return this.field.getZero();
    if (scalar === 1) return this;
    const size = this.coefficients.length;
    const product = new Int32Array(size);
    for (let i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], scalar);
    }
    return new GenericGFPoly(this.field, product);
  }

  multiplyByMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) throw new IllegalArgumentException();
    if (coefficient === 0) return this.field.getZero();
    const size = this.coefficients.length;
    const product = new Int32Array(size + degree);
    for (let i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], coefficient);
    }
    return new GenericGFPoly(this.field, product);
  }

  divide(other: GenericGFPoly): GenericGFPoly[] {
    if (!this.field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }
    if (other.isZero()) throw new IllegalArgumentException('Divide by 0');

    let quotient: GenericGFPoly = this.field.getZero();
    let remainder: GenericGFPoly = this; // NOSONAR — polynomial division requires capturing `this` before mutation
    const denominatorLeadingTerm = other.getCoefficient(other.getDegree());
    const inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

    while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
      const degreeDifference = remainder.getDegree() - other.getDegree();
      const scale = this.field.multiply(
        remainder.getCoefficient(remainder.getDegree()),
        inverseDenominatorLeadingTerm
      );
      const term = other.multiplyByMonomial(degreeDifference, scale);
      const iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }
    return [quotient, remainder];
  }

  toString(): string {
    let result = '';
    for (let degree = this.getDegree(); degree >= 0; degree--) {
      const coefficient = this.getCoefficient(degree);
      if (coefficient === 0) continue;
      result += formatPolyTerm(this.field, degree, coefficient, result.length > 0);
    }
    return result;
  }
}
