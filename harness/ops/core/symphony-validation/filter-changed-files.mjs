// Generated from ../../../scripts/ops/core/symphony-validation.mjs:187

export function filterChangedFiles(changedFiles, regex) {
  return (changedFiles || []).filter((file) => regex.test(file));
}
