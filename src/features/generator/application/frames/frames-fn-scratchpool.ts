/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Create reusable scratch canvas pool.
 */

export function createScratchCanvasPool(): {
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
  getTemporalScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
} {
  let patternScratchA: HTMLCanvasElement | null = null;
  let patternScratchB: HTMLCanvasElement | null = null;
  let temporalScratchA: HTMLCanvasElement | null = null;
  let temporalScratchB: HTMLCanvasElement | null = null;

  const getScratch = (
    slot: 0 | 1,
    width: number,
    height: number,
    getA: () => HTMLCanvasElement | null,
    setA: (c: HTMLCanvasElement) => void,
    getB: () => HTMLCanvasElement | null,
    setB: (c: HTMLCanvasElement) => void
  ): HTMLCanvasElement => {
    const current = slot === 0 ? getA() : getB();
    if (!current) {
      const created = document.createElement('canvas');
      created.width = width;
      created.height = height;
      if (slot === 0) setA(created);
      else setB(created);
      return created;
    }
    if (current.width !== width) current.width = width;
    if (current.height !== height) current.height = height;
    return current;
  };

  return {
    getPatternScratch: (slot, width, height) =>
      getScratch(
        slot,
        width,
        height,
        () => patternScratchA,
        (c) => {
          patternScratchA = c;
        },
        () => patternScratchB,
        (c) => {
          patternScratchB = c;
        }
      ),
    getTemporalScratch: (slot, width, height) =>
      getScratch(
        slot,
        width,
        height,
        () => temporalScratchA,
        (c) => {
          temporalScratchA = c;
        },
        () => temporalScratchB,
        (c) => {
          temporalScratchB = c;
        }
      ),
  };
}
