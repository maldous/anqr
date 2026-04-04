export function computeFingerprint(files) {
  // Sort for deterministic output; join paths + count is cheap and sufficient.
  const sorted = files.map((f) => f.path).sort();
  return `${sorted.length}:${sorted[0] ?? ""}:${sorted[sorted.length - 1] ?? ""}`;
}
