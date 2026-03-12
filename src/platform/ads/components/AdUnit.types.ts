export interface AdUnitProps {
  slot: string;
  width?: number | string;
  height?: number;
  className?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto';
  responsive?: boolean;
}
