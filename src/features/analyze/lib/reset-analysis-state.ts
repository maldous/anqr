import type { AnalysisStateSetters } from './analysis-runtime.types';

export function resetAnalysisState(setters: AnalysisStateSetters): void {
  setters.setError(null);
  setters.setResult(null);
  setters.setImported(false);
  setters.setUiTimings({});
}
