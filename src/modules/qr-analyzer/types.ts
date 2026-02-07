/**
 * QR Analyzer Types
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANALYZER');

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';

export type ContentType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'mecard'
  | 'email'
  | 'tel'
  | 'sms'
  | 'geo'
  | 'crypto_bitcoin'
  | 'crypto_ethereum'
  | 'crypto_other'
  | 'epc_sepa'
  | 'upi'
  | 'emv_qr'
  | 'swiss_qr_bill'
  | 'calendar_event'
  | 'otp_auth'
  | 'plain_text'
  | 'unknown';

export interface ContentTypeDetails {
  type: ContentType;
  label: string;
  url?: string;
  protocol?: string;
  wifiSsid?: string;
  wifiAuth?: string;
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  cryptoCurrency?: string;
  cryptoAddress?: string;
  amount?: string;
  hasUtmParams?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface QuietZoneInfo {
  top: number;
  right: number;
  bottom: number;
  left: number;
  adequate: boolean;
}

export interface DetectedColors {
  foreground: string;
  background: string;
  contrastRatio: number;
}

export interface DominantColorInfo {
  color: string;
  percentage: number;
  rgb: { r: number; g: number; b: number };
}

export interface DataCapacity {
  used: number;
  total: number;
  percentage: number;
  overflow: boolean;
}

export interface StructuralAnalysis {
  hasFinderPatterns: boolean;
  hasTimingPatterns: boolean;
  hasAlignmentPatterns: boolean;
  alignmentPatternCount: number;
}

export interface ImageProperties {
  width: number;
  height: number;
  aspectRatio: number;
  estimatedQrSizePx: number;
}

export interface GeometryDiagnostics {
  corners: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  topEdgePx: number;
  leftEdgePx: number;
  estimatedRotationDeg: number;
}

export interface TimingDiagnostics {
  decodeMs?: number | null;
  totalAnalysisMs?: number | null;
  encodeMs?: number | null;
  renderMs?: number | null;
  exportMs?: number | null;
}

export type ErrorType = 'no_qr_detected' | 'cors_blocked' | 'decode_error' | 'unknown';

// Import and re-export DecoderMetadata from qr-decoder to avoid duplicate type definition
import type { DecoderMetadata } from '../qr-decoder/types';
export type { DecoderMetadata };

export interface QRAnalysisResult {
  success: boolean;
  error?: string;
  errorType?: ErrorType;
  warnings?: string[];
  confidence?: 'low' | 'medium' | 'high';

  // Payload
  payload?: string;
  payloadBytes?: Uint8Array;

  // QR Structure - ALL values MUST come from decoder, never estimated
  version: number | null;
  moduleCount: number;
  eccLevel: ECCLevel | null;
  maskPattern: number | null;
  encodingMode: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' | null;
  errorsCorrected: number | null;
  /** Number of erasures corrected */
  erasures?: number | null;
  /** Orientation in degrees (0-360) */
  orientation?: number | null;
  /** Total number of bits in raw data */
  numBits?: number | null;
  /** Structured append sequence number */
  structuredAppendSequence?: number | null;
  /** Structured append parity */
  structuredAppendParity?: number | null;

  // Content Analysis
  contentType?: ContentTypeDetails;

  // Visual Analysis
  detectedColors?: DetectedColors;
  dominantColors?: DominantColorInfo[];
  estimatedModulePx: number | null;
  quietZone?: QuietZoneInfo;

  // Capacity
  dataCapacity?: DataCapacity;

  // Structure
  structuralAnalysis?: StructuralAnalysis;

  // Image
  imageProperties?: ImageProperties;
  geometry?: GeometryDiagnostics;
  timing?: TimingDiagnostics;

  // Matrix for reproduction
  moduleMatrix?: boolean[][];

  // Debug
  debugLog?: string;

  /** Complete decoder metadata for debugging - authoritative source of truth */
  decoderMetadata?: DecoderMetadata;
}
