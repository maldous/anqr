import { qrPolynomial } from '../encode/math';
import { getErrorCorrectPolynomial } from './rs-basis._internal';

/**
 * Compute ECC bytes for a data block
 * Uses polynomial division: data * x^eccCount mod generator
 *
 * @param dataBytes The data bytes
 * @param eccCount Number of ECC bytes to generate
 * @returns The ECC bytes
 */
export function computeECC(dataBytes: Uint8Array, eccCount: number): Uint8Array {
  const rsPoly = getErrorCorrectPolynomial(eccCount);
  const rawPoly = qrPolynomial(Array.from(dataBytes), rsPoly.getLength() - 1);
  const modPoly = rawPoly.mod(rsPoly);

  const ecdata = new Uint8Array(eccCount);
  for (let i = 0; i < eccCount; i++) {
    const modIndex = i + modPoly.getLength() - eccCount;
    ecdata[i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
  }

  return ecdata;
}
