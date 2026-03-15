import { useEffect, useRef } from 'react';
import { AD_CLIENT } from './ad-client';
import type { AdSenseProps } from './ad-sense-props';

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
