import { memo } from 'react';

export const BusySpinner = memo(() => {
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
