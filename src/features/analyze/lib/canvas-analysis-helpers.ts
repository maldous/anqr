import { analyzeQRCode, type QRAnalysisResult } from '@/modules/qr-analyzer';

export const cloneCanvasLike = (source: HTMLCanvasElement | OffscreenCanvas): HTMLCanvasElement => {
  const snapshot = document.createElement('canvas');
  snapshot.width = source.width;
  snapshot.height = source.height;
  const ctx = snapshot.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas snapshot for analysis');
  }
  ctx.drawImage(source as CanvasImageSource, 0, 0);
  return snapshot;
};

export const waitMs = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const countShiftedDiffs = (
  original: boolean[][],
  regen: boolean[][],
  moduleCount: number,
  dr: number,
  dc: number
): number => {
  let diffCount = 0;
  for (let r = 0; r < moduleCount; r += 1) {
    const rr = r + dr;
    if (rr < 0 || rr >= moduleCount) {
      diffCount += moduleCount;
      continue;
    }
    for (let c = 0; c < moduleCount; c += 1) {
      const cc = c + dc;
      if (cc < 0 || cc >= moduleCount) {
        diffCount += 1;
        continue;
      }
      if (original[r][c] !== regen[rr][cc]) diffCount += 1;
    }
  }
  return diffCount;
};

export const findBestMatrixShift = (
  originalMatrix: boolean[][],
  regenMatrix: boolean[][],
  moduleCount: number
): { dr: number; dc: number; diffCount: number; diffPct: number } => {
  let best = { dr: 0, dc: 0, diffCount: Number.POSITIVE_INFINITY };
  for (let dr = -2; dr <= 2; dr += 1) {
    for (let dc = -2; dc <= 2; dc += 1) {
      const diffCount = countShiftedDiffs(originalMatrix, regenMatrix, moduleCount, dr, dc);
      if (diffCount < best.diffCount) best = { dr, dc, diffCount };
    }
  }
  return {
    ...best,
    diffPct: moduleCount * moduleCount ? best.diffCount / (moduleCount * moduleCount) : 0,
  };
};

export const waitForAnimationReady = (
  maxRetries: number
): Promise<typeof globalThis.__ANQR_STATE__> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const state = globalThis.__ANQR_STATE__;
      if (state?.isAnimationReady || attempts >= maxRetries) {
        resolve(state);
        return;
      }
      attempts += 1;
      setTimeout(check, 75);
    };
    check();
  });
};

export const buildCandidateFrameIndices = (
  cachedFramesLength: number,
  currentIdx: number
): number[] => {
  const candidateIndices: number[] = [];
  const pushUnique = (idx: number) => {
    const clamped = Math.max(0, Math.min(cachedFramesLength - 1, Math.floor(idx)));
    if (!candidateIndices.includes(clamped)) candidateIndices.push(clamped);
  };

  pushUnique(currentIdx);
  pushUnique(Math.floor(cachedFramesLength * 0.25));
  pushUnique(Math.floor(cachedFramesLength * 0.5));
  pushUnique(Math.floor(cachedFramesLength * 0.75));
  pushUnique(cachedFramesLength - 1);

  return candidateIndices;
};

export const scanCachedFramesForQR = (
  cachedFrames: (HTMLCanvasElement | OffscreenCanvas)[],
  currentFrame: number
): QRAnalysisResult | null => {
  if (cachedFrames.length <= 1) return null;
  const candidateIndices = buildCandidateFrameIndices(cachedFrames.length, currentFrame);
  for (const frameIdx of candidateIndices) {
    const frame = cachedFrames[frameIdx];
    if (!frame) continue;
    const frameResult = analyzeQRCode(cloneCanvasLike(frame));
    if (frameResult.success) {
      const warnings = [...(frameResult.warnings ?? [])];
      warnings.push(`Analyzed using animation frame ${frameIdx + 1}/${cachedFrames.length}`);
      return { ...frameResult, warnings };
    }
  }
  return null;
};
