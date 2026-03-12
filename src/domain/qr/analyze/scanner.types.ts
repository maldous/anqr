export interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

export interface ScanResult {
  data: string | null;
  location: QRLocation | null;
  binaryData?: Uint8Array;
}

export interface ValidationResult {
  valid: boolean;
  data?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}
