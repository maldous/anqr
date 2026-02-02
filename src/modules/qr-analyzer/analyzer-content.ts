/**
 * QR Analyzer Content Module
 * Provides utilities for analyzing QR code content
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANALYZER');

// Types
export interface ImageProperties {
  width: number;
  height: number;
  aspectRatio: number;
  estimatedQrSizePx: number;
}

export interface DominantColor {
  color: string;
  percentage: number;
  rgb: { r: number; g: number; b: number };
}

export interface ColorInfo {
  dominantColors: DominantColor[];
  averageColor: string;
  contrastRatio: number;
}

export interface UrlDetails {
  protocol: string;
  host: string;
  pathname: string;
  hasUtmParams: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

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

export interface ContentAnalysis {
  type: ContentType;
  raw: string;
}

/**
 * Calculate average color from image data
 */
export function averageColor(imageData: ImageData): { r: number; g: number; b: number } {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
  };
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate image properties from ImageData
 */
export function calculateImageProperties(imageData: ImageData): ImageProperties {
  const { width, height } = imageData;
  return {
    width,
    height,
    aspectRatio: Math.round((width / height) * 100) / 100,
    estimatedQrSizePx: Math.min(width, height),
  };
}

/**
 * Detect content type from payload
 */
export function detectContentType(payload: string): ContentType {
  const trimmed = payload.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'url';
  if (lower.startsWith('wifi:')) return 'wifi';
  if (lower.startsWith('begin:vcard')) return 'vcard';
  if (lower.startsWith('mecard:')) return 'mecard';
  if (lower.startsWith('mailto:')) return 'email';
  if (lower.startsWith('tel:')) return 'tel';
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) return 'sms';
  if (lower.startsWith('geo:')) return 'geo';
  if (lower.startsWith('bitcoin:')) return 'crypto_bitcoin';
  if (lower.startsWith('ethereum:')) return 'crypto_ethereum';
  if (lower.startsWith('litecoin:') || lower.startsWith('dogecoin:')) return 'crypto_other';
  if (lower.startsWith('bcd')) return 'epc_sepa';
  if (lower.startsWith('upi://')) return 'upi';
  if (lower.startsWith('spc')) return 'swiss_qr_bill';
  if (lower.startsWith('begin:vcalendar') || lower.startsWith('begin:vevent'))
    return 'calendar_event';
  if (lower.startsWith('otpauth://')) return 'otp_auth';
  if (/^0002\d{2}/.test(trimmed) && /6304[A-F0-9]{4}$/i.test(trimmed)) return 'emv_qr';

  return 'plain_text';
}

/**
 * Extract dominant colors from image data
 */
export function extractDominantColors(
  imageData: ImageData,
  maxColors: number = 5
): DominantColor[] {
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
  }

  const totalPixels = data.length / 16;
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors);

  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    return {
      color: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      percentage: Math.round((count / totalPixels) * 100),
      rgb: { r, g, b },
    };
  });
}

/**
 * Parse URL details
 */
export function parseUrlDetails(url: string): UrlDetails | null {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.host,
      pathname: parsed.pathname,
      hasUtmParams:
        parsed.searchParams.has('utm_source') ||
        parsed.searchParams.has('utm_medium') ||
        parsed.searchParams.has('utm_campaign'),
      utmSource: parsed.searchParams.get('utm_source') ?? undefined,
      utmMedium: parsed.searchParams.get('utm_medium') ?? undefined,
      utmCampaign: parsed.searchParams.get('utm_campaign') ?? undefined,
    };
  } catch {
    return null;
  }
}

// Re-export rgbToHex from core
export { rgbToHex } from '../core';
