import { log } from './log';
import { safeMark } from './safe-mark';
import { safeMeasure } from './safe-measure';

export function recordQArtPerfTimings(params: {
  qartRequestMarked: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  qartComputeMs: number | null;
  qartResultSource: 'worker' | 'main';
}): { renderMs: number | null; previewMs: number | null } {
  safeMark(params.qartRenderMark);
  const renderMs = params.qartRequestMarked
    ? safeMeasure(
        `${params.qartPerfMarkPrefix}:render`,
        params.qartResultMark,
        params.qartRenderMark
      )
    : null;
  const previewMs = params.qartRequestMarked
    ? safeMeasure(
        `${params.qartPerfMarkPrefix}:preview`,
        params.qartRequestMark,
        params.qartRenderMark
      )
    : null;
  log.info('QR-Art timing', {
    source: params.qartResultSource,
    computeMs: params.qartComputeMs === null ? null : Math.round(params.qartComputeMs),
    renderMs: renderMs === null ? null : Math.round(renderMs),
    previewMs: previewMs === null ? null : Math.round(previewMs),
  });
  return { renderMs, previewMs };
}
