// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:443

export function parseCspellUnknownWords(detail) {
  const words = new Set();
  const regex = /Unknown word \(([\w-]+)\)/g;
  let match;
  while ((match = regex.exec(detail)) !== null) {
    words.add(match[1].toLowerCase());
  }
  return [...words];
}
