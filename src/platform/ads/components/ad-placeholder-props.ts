// Placeholder component for development/preview
export interface AdPlaceholderProps {
  /** Ad slot identifier for tracking */
  readonly slot: string;
  /** Width of the ad - can be number (px) or string (e.g., '100%', 'auto') */
  readonly width?: number | string;
  /** Height of the ad in pixels */
  readonly height?: number;
  /** Additional CSS classes */
  readonly className?: string;
  /** Format type for responsive ads */
  readonly format?: "horizontal" | "vertical" | "rectangle" | "auto";
}
