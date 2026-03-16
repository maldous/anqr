import type { QRPolynomial } from "../../../modules/qr-encoder/types";
import { gexp } from "./gexp";
import { glog } from "./glog";

/**
 * Create a polynomial for Reed-Solomon encoding
 */
export function qrPolynomial(num: number[], shift: number): QRPolynomial {
  if (num.length === undefined) {
    throw new TypeError(`${num.length}/${shift}`);
  }

  // Remove leading zeros
  const _num = ((): number[] => {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }
    const result = Array.from<number>({ length: num.length - offset + shift });
    for (let i = 0; i < num.length - offset; i += 1) {
      result[i] = num[i + offset];
    }
    return result;
  })();

  const _this: QRPolynomial = {
    getAt: (index: number) => _num[index],
    getLength: () => _num.length,

    multiply: (e: QRPolynomial): QRPolynomial => {
      const result = Array.from<number>({ length: _this.getLength() + e.getLength() - 1 });
      for (let i = 0; i < result.length; i++) {
        result[i] = 0;
      }

      for (let i = 0; i < _this.getLength(); i += 1) {
        for (let j = 0; j < e.getLength(); j += 1) {
          result[i + j] ^= gexp(glog(_this.getAt(i)) + glog(e.getAt(j)));
        }
      }

      return qrPolynomial(result, 0);
    },

    mod: (e: QRPolynomial): QRPolynomial => {
      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      const ratio = glog(_this.getAt(0)) - glog(e.getAt(0));

      const result = Array.from<number>({ length: _this.getLength() });
      for (let i = 0; i < _this.getLength(); i += 1) {
        result[i] = _this.getAt(i);
      }

      for (let i = 0; i < e.getLength(); i += 1) {
        result[i] ^= gexp(glog(e.getAt(i)) + ratio);
      }

      // Recursive call
      return qrPolynomial(result, 0).mod(e);
    },
  };

  return _this;
}
