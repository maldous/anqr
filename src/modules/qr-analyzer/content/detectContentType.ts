/**
 * Content Type Detection
 * Analyzes QR code content to determine its type
 */

export type ContentType = 
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'mecard'
  | 'geo'
  | 'calendar'
  | 'text';

export interface ContentAnalysis {
  type: ContentType;
  raw: string;
  parsed?: Record<string, unknown>;
}

/**
 * Detect the content type from a QR code's decoded data
 */
export function detectContentType(data: string): ContentType {
  const trimmed = data.trim();
  const lower = trimmed.toLowerCase();
  
  // URL patterns
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
    return 'url';
  }
  
  // Email
  if (lower.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'email';
  }
  
  // Phone
  if (lower.startsWith('tel:') || /^\+?[0-9\s\-()]{7,}$/.test(trimmed)) {
    return 'phone';
  }
  
  // SMS
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) {
    return 'sms';
  }
  
  // WiFi
  if (lower.startsWith('wifi:')) {
    return 'wifi';
  }
  
  // vCard
  if (lower.startsWith('begin:vcard')) {
    return 'vcard';
  }
  
  // MeCard
  if (lower.startsWith('mecard:')) {
    return 'mecard';
  }
  
  // Geo location
  if (lower.startsWith('geo:')) {
    return 'geo';
  }
  
  // Calendar event
  if (lower.startsWith('begin:vevent') || lower.startsWith('begin:vcalendar')) {
    return 'calendar';
  }
  
  // Default to text
  return 'text';
}
