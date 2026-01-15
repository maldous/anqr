import type { QRLocation } from '../decoder/core';

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

export interface DetectedColors {
  foreground: string; // hex color
  background: string; // hex color
  foregroundRgb: { r: number; g: number; b: number };
  backgroundRgb: { r: number; g: number; b: number };
  contrastRatio: number;
}

export interface ContentTypeDetails {
  type: ContentType;
  label: string; // Human-readable label
  // Parsed details based on content type
  url?: string;
  protocol?: string;
  wifiSsid?: string;
  wifiAuth?: string;
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  cryptoAddress?: string;
  cryptoCurrency?: string;
  amount?: string;
  // UTM parameters if present
  hasUtmParams?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}


/**
 * Parse URL details including UTM parameters
 */


// ============================================
// COLOR EXTRACTION
// ============================================

/**
 * Extract dominant foreground and background colors from QR code image
 */


/**
 * Create a transform for color sampling
 * Accounts for corner positions being at finder pattern centers (3.5 modules from edge)
 */
 {
  const finderOffset = 3.5;
  const effectiveModuleSpan = moduleCount - 2 * finderOffset;
  
  return (col: number, row: number) => {
    // Add 0.5 to sample at module centers instead of corners
    const u = (col + 0.5 - finderOffset) / effectiveModuleSpan;
    const v = (row + 0.5 - finderOffset) / effectiveModuleSpan;

    const x =
      (1 - u) * (1 - v) * location.topLeft.x +
      u * (1 - v) * location.topRight.x +
      u * v * location.bottomRight.x +
      (1 - u) * v * location.bottomLeft.x;

    const y =
      (1 - u) * (1 - v) * location.topLeft.y +
      u * (1 - v) * location.topRight.y +
      u * v * location.bottomRight.y +
      (1 - u) * v * location.bottomLeft.y;

    return { x, y };
  };
}

/**
 * Calculate average color from array of pixels
 */
>
): { r: number; g: number; b: number } {
  if (pixels.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (const pixel of pixels) {
    totalR += pixel.r;
    totalG += pixel.g;
    totalB += pixel.b;
  }

  return {
    r: Math.round(totalR / pixels.length),
    g: Math.round(totalG / pixels.length),
    b: Math.round(totalB / pixels.length),
  };
}

/**
 * Convert RGB to hex color string
 */
): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
,
  bg: { r: number; g: number; b: number }
): number {
  const luminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const srgb = c / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

// ============================================
// MODULE SIZE ESTIMATION
// ============================================

/**
 * Calculate image properties for analysis display
 */


/**
 * Estimate the pixel size of each module in the QR code
 */
