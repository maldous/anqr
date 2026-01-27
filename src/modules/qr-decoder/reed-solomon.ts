/**
 * QR Decoder Reed-Solomon
 * Galois Field arithmetic and Reed-Solomon error correction decoding
 */

import { arraycopy, Integer } from './util';
import { IllegalArgumentException, ArithmeticException, ReedSolomonException, IllegalStateException } from './exceptions';

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

/**
 * Polynomial over a Galois Field
 */
export class GenericGFPoly {
  private field: AbstractGenericGF;
  private coefficients: Int32Array;

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
      sumDiff[i] = AbstractGenericGF.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
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
        product[i + j] = AbstractGenericGF.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
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
    let remainder: GenericGFPoly = this;
    const denominatorLeadingTerm = other.getCoefficient(other.getDegree());
    const inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

    while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
      const degreeDifference = remainder.getDegree() - other.getDegree();
      const scale = this.field.multiply(remainder.getCoefficient(remainder.getDegree()), inverseDenominatorLeadingTerm);
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
      let coefficient = this.getCoefficient(degree);
      if (coefficient !== 0) {
        if (coefficient < 0) {
          result += ' - ';
          coefficient = -coefficient;
        } else if (result.length > 0) {
          result += ' + ';
        }
        if (degree === 0 || coefficient !== 1) {
          const alphaPower = this.field.log(coefficient);
          if (alphaPower === 0) {
            result += '1';
          } else if (alphaPower === 1) {
            result += 'a';
          } else {
            result += 'a^' + alphaPower;
          }
        }
        if (degree !== 0) {
          if (degree === 1) {
            result += 'x';
          } else {
            result += 'x^' + degree;
          }
        }
      }
    }
    return result;
  }
}

/**
 * Generic Galois Field implementation
 */
export class GenericGF extends AbstractGenericGF {
  static AZTEC_DATA_12 = new GenericGF(0x1069, 4096, 1);
  static AZTEC_DATA_10 = new GenericGF(0x409, 1024, 1);
  static AZTEC_DATA_6 = new GenericGF(0x43, 64, 1);
  static AZTEC_PARAM = new GenericGF(0x13, 16, 1);
  static QR_CODE_FIELD_256 = new GenericGF(0x011d, 256, 0);
  static DATA_MATRIX_FIELD_256 = new GenericGF(0x012d, 256, 1);
  static AZTEC_DATA_8 = GenericGF.DATA_MATRIX_FIELD_256;
  static MAXICODE_FIELD_64 = GenericGF.AZTEC_DATA_6;

  private zero: GenericGFPoly;
  private one: GenericGFPoly;

  constructor(
    private primitive: number,
    private size: number,
    private generatorBase: number
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
    return 'GF(0x' + Integer.toHexString(this.primitive) + ',' + this.size + ')';
  }

  equals(o: any): boolean {
    return o === this;
  }
}

/**
 * Reed-Solomon decoder
 */
export class ReedSolomonDecoder {
  constructor(private field: GenericGF) {}

  decode(received: Int32Array, twoS: number): void {
    const poly = new GenericGFPoly(this.field, received);
    const syndromeCoefficients = new Int32Array(twoS);
    let noError = true;
    for (let i = 0; i < twoS; i++) {
      const evalResult = poly.evaluateAt(this.field.exp(i + this.field.getGeneratorBase()));
      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evalResult;
      if (evalResult !== 0) noError = false;
    }
    if (noError) return;

    const syndrome = new GenericGFPoly(this.field, syndromeCoefficients);
    const sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
    const sigma = sigmaOmega[0];
    const omega = sigmaOmega[1];
    const errorLocations = this.findErrorLocations(sigma);
    const errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations);
    for (let i = 0; i < errorLocations.length; i++) {
      const position = received.length - 1 - this.field.log(errorLocations[i]);
      if (position < 0) throw new ReedSolomonException('Bad error location');
      received[position] = GenericGF.addOrSubtract(received[position], errorMagnitudes[i]);
    }
  }

  private runEuclideanAlgorithm(a: GenericGFPoly, b: GenericGFPoly, R: number): GenericGFPoly[] {
    if (a.getDegree() < b.getDegree()) {
      const temp = a;
      a = b;
      b = temp;
    }

    let rLast = a;
    let r = b;
    let tLast = this.field.getZero();
    let t = this.field.getOne();

    while (r.getDegree() >= (R / 2 | 0)) {
      const rLastLast = rLast;
      const tLastLast = tLast;
      rLast = r;
      tLast = t;

      if (rLast.isZero()) throw new ReedSolomonException('r_{i-1} was zero');
      r = rLastLast;
      let q = this.field.getZero();
      const denominatorLeadingTerm = rLast.getCoefficient(rLast.getDegree());
      const dltInverse = this.field.inverse(denominatorLeadingTerm);
      while (r.getDegree() >= rLast.getDegree() && !r.isZero()) {
        const degreeDiff = r.getDegree() - rLast.getDegree();
        const scale = this.field.multiply(r.getCoefficient(r.getDegree()), dltInverse);
        q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
        r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
      }
      t = q.multiply(tLast).addOrSubtract(tLastLast);
      if (r.getDegree() >= rLast.getDegree()) {
        throw new IllegalStateException('Division algorithm failed to reduce polynomial?');
      }
    }

    const sigmaTildeAtZero = t.getCoefficient(0);
    if (sigmaTildeAtZero === 0) throw new ReedSolomonException('sigmaTilde(0) was zero');

    const inverse = this.field.inverse(sigmaTildeAtZero);
    const sigma = t.multiplyScalar(inverse);
    const omega = r.multiplyScalar(inverse);
    return [sigma, omega];
  }

  private findErrorLocations(errorLocator: GenericGFPoly): Int32Array {
    const numErrors = errorLocator.getDegree();
    if (numErrors === 1) return Int32Array.from([errorLocator.getCoefficient(1)]);
    const result = new Int32Array(numErrors);
    let e = 0;
    for (let i = 1; i < this.field.getSize() && e < numErrors; i++) {
      if (errorLocator.evaluateAt(i) === 0) {
        result[e] = this.field.inverse(i);
        e++;
      }
    }
    if (e !== numErrors) {
      throw new ReedSolomonException('Error locator degree does not match number of roots');
    }
    return result;
  }

  private findErrorMagnitudes(errorEvaluator: GenericGFPoly, errorLocations: Int32Array): Int32Array {
    const s = errorLocations.length;
    const result = new Int32Array(s);
    for (let i = 0; i < s; i++) {
      const xiInverse = this.field.inverse(errorLocations[i]);
      let denominator = 1;
      for (let j = 0; j < s; j++) {
        if (i !== j) {
          const term = this.field.multiply(errorLocations[j], xiInverse);
          const termPlus1 = (term & 0x1) === 0 ? term | 1 : term & ~1;
          denominator = this.field.multiply(denominator, termPlus1);
        }
      }
      result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
      if (this.field.getGeneratorBase() !== 0) {
        result[i] = this.field.multiply(result[i], xiInverse);
      }
    }
    return result;
  }
}
