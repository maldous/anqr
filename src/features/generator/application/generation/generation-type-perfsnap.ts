/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Performance snapshot type for QArt generation.
 */

export type QArtPerfSnapshot = {
  source: 'worker' | 'main';
  computeMs: number | null;
  renderMs: number | null;
  previewMs: number | null;
  version: number;
  maskPattern: number;
};
