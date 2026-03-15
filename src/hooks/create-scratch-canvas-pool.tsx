export function createScratchCanvasPool(): {
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
  getTemporalScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
} {
  const patternScratch: [HTMLCanvasElement | null, HTMLCanvasElement | null] = [null, null];
  const temporalScratch: [HTMLCanvasElement | null, HTMLCanvasElement | null] = [null, null];

  const getScratch = (
    pool: [HTMLCanvasElement | null, HTMLCanvasElement | null],
    slot: 0 | 1,
    width: number,
    height: number
  ): HTMLCanvasElement => {
    const current = pool[slot];
    if (!current) {
      const created = document.createElement('canvas');
      created.width = width;
      created.height = height;
      pool[slot] = created;
      return created;
    }
    if (current.width !== width) current.width = width;
    if (current.height !== height) current.height = height;
    return current;
  };

  return {
    getPatternScratch: (slot, width, height) => getScratch(patternScratch, slot, width, height),
    getTemporalScratch: (slot, width, height) => getScratch(temporalScratch, slot, width, height),
  };
}
