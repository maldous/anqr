export type QArtPerfSnapshot = {
  source: "worker" | "main";
  computeMs: number | null;
  renderMs: number | null;
  previewMs: number | null;
  version: number;
  maskPattern: number;
};
