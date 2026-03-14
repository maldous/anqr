import type { DitherAttemptPatch } from './qr-generator-scan-gate';

export function buildDitherAttemptList(
  baseAttempts: DitherAttemptPatch[],
  cachedPatch: DitherAttemptPatch | null,
  isAnimatedFrame: boolean,
  isFirstAnimatedFrame: boolean,
  isAnimatedPreviewFrame: boolean,
  patchSignature: (patch: DitherAttemptPatch) => string
): DitherAttemptPatch[] {
  let attempts: DitherAttemptPatch[] = [];
  const seenAttemptSignatures = new Set<string>();
  const pushUniqueAttempt = (patch: DitherAttemptPatch): void => {
    const sig = patchSignature(patch);
    if (seenAttemptSignatures.has(sig)) return;
    seenAttemptSignatures.add(sig);
    attempts.push(patch);
  };
  if (baseAttempts.length > 0) {
    pushUniqueAttempt(baseAttempts[0]);
    for (const patch of baseAttempts.slice(1)) pushUniqueAttempt(patch);
  }
  if (cachedPatch) {
    if (isAnimatedFrame && !isFirstAnimatedFrame) {
      const sig = patchSignature(cachedPatch);
      if (!seenAttemptSignatures.has(sig)) {
        seenAttemptSignatures.add(sig);
        attempts.unshift(cachedPatch);
      }
    } else {
      pushUniqueAttempt(cachedPatch);
    }
  }
  if (isAnimatedPreviewFrame) {
    const compact: DitherAttemptPatch[] = [];
    const compactSeen = new Set<string>();
    const pushCompact = (patch: DitherAttemptPatch | undefined): void => {
      if (!patch) return;
      const sig = patchSignature(patch);
      if (compactSeen.has(sig)) return;
      compactSeen.add(sig);
      compact.push(patch);
    };
    pushCompact(cachedPatch ?? undefined);
    pushCompact(baseAttempts[0]);
    pushCompact(baseAttempts[1]);
    pushCompact(baseAttempts[2]);
    if (compact.length === 0 && attempts[0]) pushCompact(attempts[0]);
    attempts = compact;
  }
  return attempts;
}
