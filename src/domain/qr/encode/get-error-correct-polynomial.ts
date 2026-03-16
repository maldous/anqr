import { gexp, qrPolynomial } from "./math";
import type { QRPolynomial } from "../../../modules/qr-encoder/types";

/**
 * Get error correction polynomial
 */
export function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
  let a = qrPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i += 1) {
    a = a.multiply(qrPolynomial([1, gexp(i)], 0));
  }
  return a;
}
