import { memo } from 'react';

/**
 * BusyOverlay Component
 *
 * Lightweight busy indicator with stage text and progress feedback.
 * Can be used as a fullscreen overlay or scoped to a relative container.
 */

interface BusyOverlayProps {
  /** Whether to show the overlay */
  visible: boolean;
  /** Optional stage description */
  stage?: string;
  /** Optional completion percentage (0-100) */
  progress?: number | null;
  /** Full viewport overlay when true, container-scoped when false */
  fullScreen?: boolean;
}

function clampProgress(progress: number | null | undefined): number {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

const BusySpinner = memo(function BusySpinner() {
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

export function BusyOverlay({
  visible,
  stage = 'Working...',
  progress = null,
  fullScreen = true,
}: Readonly<BusyOverlayProps>) {
  if (!visible) return null;

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
      <div className="w-[240px] max-w-[88%] rounded-md bg-black/72 px-3 py-2.5 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <BusySpinner />
          <div className="min-w-0 text-xs font-medium leading-tight">{stage}</div>
        </div>
        {hasProgress && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-emerald-300 transition-[width] duration-200"
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-white/80">{normalizedProgress}%</div>
          </div>
        )}
      </div>
    </div>
  );
}
