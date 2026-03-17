export interface TimingDiagnostics {
  decodeMs?: number | null;
  totalAnalysisMs?: number | null;
  encodeMs?: number | null;
  renderMs?: number | null;
  exportMs?: number | null;
}
