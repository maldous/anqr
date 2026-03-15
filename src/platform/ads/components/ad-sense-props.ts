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
