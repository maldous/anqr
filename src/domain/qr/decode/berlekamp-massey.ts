import { gfInv, gfMul } from './rs-rootability-gf';

export function berlekampMassey(syndromes: number[]): { sigma: number[]; degree: number } {
  const C: number[] = [1];
  const B: number[] = [1];
  let L = 0;
  let m = 1;
  let b = 1;

  for (let n = 0; n < syndromes.length; n++) {
    let d = syndromes[n] ?? 0;

    for (let i = 1; i <= L; i++) {
      d ^= gfMul(C[i] ?? 0, syndromes[n - i] ?? 0);
    }

    if (d === 0) {
      m++;
      continue;
    }

    const T = C.slice();
    const coef = gfMul(d, gfInv(b));

    for (let i = 0; i < B.length; i++) {
      const idx = i + m;
      C[idx] = (C[idx] ?? 0) ^ gfMul(coef, B[i] ?? 0);
    }

    if (2 * L <= n) {
      L = n + 1 - L;
      b = d;
      B.length = 0;

      for (let i = 0; i < T.length; i++) {
        B.push(T[i] ?? 0);
      }

      m = 1;
    } else {
      m++;
    }
  }

  while (C.length > 1 && C[C.length - 1] === 0) {
    C.pop();
  }

  return { sigma: C, degree: L };
}
