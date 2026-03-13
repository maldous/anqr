import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BusyOverlay Component
 *
 * Lightweight busy indicator with stage text and progress feedback.
 * Can be used as a fullscreen overlay or scoped to a relative container.
 */

type BusyOverlayProps = {
  /** Whether to show the overlay */
  visible: boolean;
  /** Optional stage description */
  stage?: string;
  /** Optional completion percentage (0-100) */
  progress?: number | null;
  /** Full viewport overlay when true, container-scoped when false */
  fullScreen?: boolean;
  /** Optional cancel action for in-progress work */
  onCancel?: () => void;
  /** Optional label for the cancel button */
  cancelLabel?: string;
};

const clampProgress = (progress: number | null | undefined): number => {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

const BusySpinner = memo(() => {
  return (
    <>
      <style>{`
        @keyframes anqr-busy-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="h-4 w-4 flex-shrink-0 rounded-full border-2"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.28)',
          borderTopColor: '#ffffff',
          animation: 'anqr-busy-spin 900ms linear infinite',
        }}
        aria-hidden="true"
      />
    </>
  );
});

export const BusyOverlay = ({
  visible,
  stage,
  progress = null,
  fullScreen = true,
  onCancel,
  cancelLabel,
}: Readonly<BusyOverlayProps>) => {
  const { t } = useTranslation();
  if (!visible) return null;
  const resolvedStage = stage ?? t('preview.busy.workingOnIt', 'Working on it...');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel', 'Cancel');

  const hasProgress = typeof progress === 'number' && Number.isFinite(progress);
  const normalizedProgress = clampProgress(progress);
  const overlayClass = fullScreen
    ? 'fixed inset-0 z-[100] flex items-center justify-center'
    : 'absolute inset-0 z-20 flex items-center justify-center rounded-lg';

  return (
    <div
      className={overlayClass}
      style={{
        backgroundColor: fullScreen ? 'rgba(8, 10, 14, 0.42)' : 'rgba(255, 255, 255, 0.28)',
        backdropFilter: fullScreen ? 'blur(4px)' : 'blur(1.5px)',
      }}
    >
      <div className="w-[288px] max-w-[90%] rounded-md bg-black/72 px-3 py-2.5 text-white shadow-lg">
        <div className="grid grid-cols-[16px_1fr] items-start gap-x-2">
          <BusySpinner />
          <div
            className="min-w-0 h-[2.4rem] overflow-hidden text-xs font-medium leading-[1.2] text-white/95"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
            title={resolvedStage}
          >
            {resolvedStage}
          </div>
        </div>
        {hasProgress && (
          <div className="mt-2 h-[1.9rem]">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-emerald-300 transition-[width] duration-200"
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
            <div className="mt-1 h-[0.8rem] text-right text-[10px] leading-[0.8rem] text-white/80">
              {normalizedProgress}%
            </div>
          </div>
        )}
        {onCancel && (
          <div className="mt-2.5 flex h-7 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-rose-200/70 bg-rose-500/75 px-2 py-1 text-[11px] font-semibold text-white transition-colors duration-150 hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/90 active:bg-rose-300"
              aria-label={resolvedCancelLabel}
            >
              {resolvedCancelLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
