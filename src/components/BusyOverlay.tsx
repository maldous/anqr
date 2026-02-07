/**
 * BusyOverlay Component
 *
 * Modern, minimal visual busy indicator for long-running operations.
 * No text - pure CSS animation. Always appears fullscreen centered.
 */

interface BusyOverlayProps {
  /** Whether to show the overlay */
  visible: boolean;
}

export function BusyOverlay({ visible }: Readonly<BusyOverlayProps>) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      {/* Modern spinner - simple border technique */}
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
        }}
      />
    </div>
  );
}
