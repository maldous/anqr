/**
 * AdSense Component
 * Displays Google AdSense ads with proper configuration
 */

import { useEffect, useRef } from 'react';

// Type declaration for Google AdSense
declare global {
  var adsbygoogle: Record<string, unknown>[] | undefined;
}

// AdSense Publisher ID
const AD_CLIENT = 'ca-pub-2270701384951162';

interface AdSenseProps {
  /** Ad slot identifier */
  readonly slot: string;
  /** Ad format */
  readonly format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  /** Full width responsive */
  readonly responsive?: boolean;
  /** Additional CSS classes */
  readonly className?: string;
  /** Fixed width in pixels (optional) */
  readonly width?: number;
  /** Fixed height in pixels (optional) */
  readonly height?: number;
}

export function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  width,
  height,
}: AdSenseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Reset on slot change to handle SPA navigation
    isLoaded.current = false;

    const tryLoadAd = () => {
      if (isLoaded.current) return;

      // Check if element is visible (has width > 0)
      // AdSense fails with "No slot size for availableWidth=0" on hidden elements
      const wrapper = wrapperRef.current;
      if (!wrapper || wrapper.offsetWidth === 0) {
        return; // Don't try to load ad on hidden elements
      }

      // Push ad to AdSense
      if (typeof globalThis !== 'undefined' && globalThis.adsbygoogle) {
        globalThis.adsbygoogle.push({});
        isLoaded.current = true;
      }
    };

    // Small delay to ensure DOM is ready after SPA navigation
    const timer = setTimeout(tryLoadAd, 100);

    // Also try on resize in case element becomes visible
    const resizeObserver = new ResizeObserver(() => {
      if (!isLoaded.current) {
        tryLoadAd();
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, []);

  // Wrapper style to maintain FIXED height even if AdSense collapses the inner element
  // Using fixed height (not minHeight) to prevent layout shift when ads load/fail
  const wrapperStyle: React.CSSProperties = {
    height: height ? `${height}px` : '90px',
    width: width ? `${width}px` : '100%',
    overflow: 'hidden', // Prevent ads from expanding beyond allocated space
  };

  const insStyle: React.CSSProperties = {
    display: 'block',
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
  };

  return (
    <div ref={wrapperRef} style={wrapperStyle} className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={insStyle}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Placeholder component for development/preview
interface AdPlaceholderProps {
  /** Ad slot identifier for tracking */
  readonly slot: string;
  /** Width of the ad - can be number (px) or string (e.g., '100%', 'auto') */
  readonly width?: number | string;
  /** Height of the ad in pixels */
  readonly height?: number;
  /** Additional CSS classes */
  readonly className?: string;
  /** Format type for responsive ads */
  readonly format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto';
}

export function AdPlaceholder({
  slot,
  width = '100%',
  height = 90,
  className = '',
  format = 'auto',
}: AdPlaceholderProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const isProduction = import.meta.env.PROD;
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  // In production test mode, show a more polished placeholder
  if (isProduction && isTestMode) {
    return (
      <div
        className={`ad-placeholder bg-gradient-to-br from-muted/60 to-muted/30 border border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-1 ${className}`}
        style={{
          width: widthStyle,
          height: `${height}px`,
          minHeight: `${height}px`,
        }}
        data-ad-slot={slot}
        data-ad-format={format}
      >
        <span className="text-xs font-medium text-muted-foreground/70">Advertisement</span>
        <span className="text-[10px] text-muted-foreground/50">(Test Mode)</span>
      </div>
    );
  }

  // Development placeholder with slot name for debugging
  return (
    <div
      className={`ad-placeholder bg-muted/50 border border-dashed border-muted-foreground/40 rounded flex items-center justify-center text-xs text-muted-foreground ${className}`}
      style={{
        width: widthStyle,
        height: `${height}px`,
        minHeight: `${height}px`,
      }}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      <span>Ad: {slot}</span>
    </div>
  );
}
