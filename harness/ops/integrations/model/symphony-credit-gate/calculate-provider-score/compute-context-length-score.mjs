// Log-scaled context-length score: 4K→0.1, 8K→0.2, 32K→0.5, 128K→0.8, 1M→1.0
export function computeContextLengthScore(contextLength) {
  if (!contextLength || contextLength <= 0) return 0.3; // unknown = neutral baseline
  const logVal = Math.log2(contextLength / 1024); // 4K→2, 128K→7, 1M→10
  return Math.min(1, Math.max(0, (logVal - 1) / 9)); // 4K→0.11, 128K→0.67, 1M→1.0
}
