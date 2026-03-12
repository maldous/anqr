// Type declaration for Google AdSense
declare global {
  var adsbygoogle: Record<string, unknown>[] | undefined;
}

// AdSense Publisher ID
const AD_CLIENT = 'ca-pub-2270701384951162';

export interface AdSenseProps {
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

export { AD_CLIENT };
export type { AdPlaceholderProps };
