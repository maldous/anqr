import { IllegalStateException, ReedSolomonException } from "./exceptions";
import { GenericGF } from "./generic-gf";
import { GenericGFPoly } from "./generic-gf-poly";

/**
 * Reed-Solomon decoder
 */
export class ReedSolomonDecoder {
  constructor(private readonly field: GenericGF) {}

  private computeSyndromes(received: Int32Array, twoS: number): Int32Array | null {
    const poly = new GenericGFPoly(this.field, received);
    const syndromeCoefficients = new Int32Array(twoS);
    let noError = true;
    for (let i = 0; i < twoS; i++) {
      const evalResult = poly.evaluateAt(this.field.exp(i + this.field.getGeneratorBase()));
      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evalResult;
      if (evalResult !== 0) noError = false;
    }
    return noError ? null : syndromeCoefficients;
  }

  private applyCorrections(
    received: Int32Array,
    errorLocations: Int32Array,
    errorMagnitudes: Int32Array,
  ): void {
    for (let i = 0; i < errorLocations.length; i++) {
      const position = received.length - 1 - this.field.log(errorLocations[i]);
      if (position < 0) throw new ReedSolomonException("Bad error location");
      received[position] = GenericGF.addOrSubtract(received[position], errorMagnitudes[i]);
    }
  }

  decode(received: Int32Array, twoS: number): void {
    const syndromeCoefficients = this.computeSyndromes(received, twoS);
    if (syndromeCoefficients === null) return;

    const syndrome = new GenericGFPoly(this.field, syndromeCoefficients);
    const sigmaOmega = this.runEuclideanAlgorithm(
      this.field.buildMonomial(twoS, 1),
      syndrome,
      twoS,
    );
    const sigma = sigmaOmega[0];
    const omega = sigmaOmega[1];
    const errorLocations = this.findErrorLocations(sigma);
    const errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations);
    this.applyCorrections(received, errorLocations, errorMagnitudes);
  }

  private polyDivide(
    dividend: GenericGFPoly,
    divisor: GenericGFPoly,
  ): { quotient: GenericGFPoly; remainder: GenericGFPoly } {
    let r = dividend;
    let q = this.field.getZero();
    const dltInverse = this.field.inverse(divisor.getCoefficient(divisor.getDegree()));
    while (r.getDegree() >= divisor.getDegree() && !r.isZero()) {
      const degreeDiff = r.getDegree() - divisor.getDegree();
      const scale = this.field.multiply(r.getCoefficient(r.getDegree()), dltInverse);
      q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
      r = r.addOrSubtract(divisor.multiplyByMonomial(degreeDiff, scale));
    }
    return { quotient: q, remainder: r };
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

    while (r.getDegree() >= Math.trunc(R / 2)) {
      const rLastLast = rLast;
      const tLastLast = tLast;
      rLast = r;
      tLast = t;

      if (rLast.isZero()) throw new ReedSolomonException("r_{i-1} was zero");
      const div = this.polyDivide(rLastLast, rLast);
      r = div.remainder;
      t = div.quotient.multiply(tLast).addOrSubtract(tLastLast);
      if (r.getDegree() >= rLast.getDegree()) {
        throw new IllegalStateException("Division algorithm failed to reduce polynomial?");
      }
    }

    const sigmaTildeAtZero = t.getCoefficient(0);
    if (sigmaTildeAtZero === 0) throw new ReedSolomonException("sigmaTilde(0) was zero");

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
      throw new ReedSolomonException("Error locator degree does not match number of roots");
    }
    return result;
  }

  private findErrorMagnitudes(
    errorEvaluator: GenericGFPoly,
    errorLocations: Int32Array,
  ): Int32Array {
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
      result[i] = this.field.multiply(
        errorEvaluator.evaluateAt(xiInverse),
        this.field.inverse(denominator),
      );
      if (this.field.getGeneratorBase() !== 0) {
        result[i] = this.field.multiply(result[i], xiInverse);
      }
    }
    return result;
  }
}
