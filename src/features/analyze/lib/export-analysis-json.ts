import { Capacitor } from '@capacitor/core';
import { buildAnalysisExportData } from '@/modules/qr-analyzer';
import { saveFileNative } from '@/platform/browser/io';
import { nowMs } from '@/features/analyze/lib/formatters';
import type { ExportAnalysisJSONParams } from './analysis-runtime.types';

export function exportAnalysisJSON(params: ExportAnalysisJSONParams): void {
  const { result, uiTimings, analysisSource, actualUsedVersion, setUiTimings } = params;
  if (!result.success) return;
  const exportStartMs = nowMs();
  const exportData = buildAnalysisExportData(
    {
      ...result,
      timing: {
        ...result.timing,
        encodeMs: uiTimings.encodeMs ?? result.timing?.encodeMs ?? null,
        renderMs: uiTimings.renderMs ?? result.timing?.renderMs ?? null,
        exportMs: null,
      },
    },
    { source: analysisSource, actualUsedVersion }
  );
  const exportMs = Math.round((nowMs() - exportStartMs) * 100) / 100;
  exportData.analysis.timing = { ...exportData.analysis.timing, exportMs };
  exportData.diagnostics.summary.exportMs = exportMs;
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  setUiTimings((prev) => ({ ...prev, exportMs }));
  const filename = `qr-analysis-${Date.now()}.json`;
  if (Capacitor.isNativePlatform()) {
    void saveFileNative(filename, blob);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
