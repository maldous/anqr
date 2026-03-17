import { GF_EXP } from "./gf-exp.const";
import { GF_LOG } from "./gf-log.const";
import { gfInitState } from "./gf-init-state";

export function initGF(): void {
  if (gfInitState.value) return;
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  gfInitState.value = true;
}
