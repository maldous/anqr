import { GF_EXP } from './gf-exp.const';
import { GF_LOG } from './gf-log.const';

export function initGF(): void {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  GF_LOG[0] = 255;
}
