import { gexp, qrPolynomial } from '../encode/math';

/**
 * Create the error correction polynomial for a given ECC length
 * This is the generator polynomial g(x) = (x-α^0)(x-α^1)...(x-α^(n-1))
 */
export function getErrorCorrectPolynomial(eccCount: number) {
  let a = qrPolynomial([1], 0);
  for (let i = 0; i < eccCount; i++) {
    a = a.multiply(qrPolynomial([1, gexp(i)], 0));
  }
  return a;
}
