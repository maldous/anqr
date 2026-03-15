import { useEffect, useState } from 'react';
import { createLogger } from '@/infra/logging/logger';
import type { QRAnalysisResult } from '@/modules/qr-analyzer';
import type { AnalysisSourceType } from './analyze-runtime';
import type { ReproductionQrState, ReproductionRenderState } from './reproduction-types';
import { reproduceQRCode } from './reproduction-render';

const log = createLogger('ANALYZE');

export function useReproductionEffect(
  result: QRAnalysisResult | null,
  reproducedCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  analysisSource: AnalysisSourceType,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  qrState: ReproductionQrState,
  renderState: ReproductionRenderState
) {
  const [actualUsedVersion, setActualUsedVersion] = useState<number | null>(null);
  const [uiTimings, setUiTimings] = useState<{
    encodeMs?: number | null;
    renderMs?: number | null;
    exportMs?: number | null;
  }>({});

  useEffect(() => {
    if (!(result?.success && result.payload && reproducedCanvasRef.current)) return;
    const canvas = reproducedCanvasRef.current;
    try {
      const reproResult = reproduceQRCode({
        result,
        canvas,
        analysisSource,
        generatedCanvas,
        qrState,
        renderState,
      });
      setActualUsedVersion(reproResult.actualVersionUsed);
      setUiTimings((prev) => ({
        ...prev,
        encodeMs: reproResult.encodeMs,
        renderMs: reproResult.renderMs,
      }));
    } catch (err) {
      setUiTimings((prev) => ({ ...prev, encodeMs: null, renderMs: null }));
      log.error('Failed to generate QR code', { error: err });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 200;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#999';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generation failed', 100, 100);
      }
    }
  }, [result, analysisSource, generatedCanvas, qrState, renderState, reproducedCanvasRef]);

  return { actualUsedVersion, uiTimings, setUiTimings };
}
