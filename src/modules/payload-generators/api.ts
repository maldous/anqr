/**
 * Payload Generators Module - Public API Manifest
 *
 * This file documents all public exports from the payload-generators module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('PAYLOAD');

// Core generators
export const CORE_API = [
  'generateUrl',
  'generateEmail',
  'generateSms',
  'generateTel',
  'generateWifi',
  'generateGeo',
] as const;

// Contact generators
export const CONTACT_API = ['generateVCard', 'generateMeCard', 'generateBizCard'] as const;

// Calendar generators
export const CALENDAR_API = ['generateEvent', 'generateCalendarSubscription'] as const;

// Payment generators
export const PAYMENT_API = [
  'generateAusPayNet',
  'generateBharatQR',
  'generateCashApp',
  'generateCrypto',
  'generateDuitNow',
  'generateEMVMPM',
  'generateEPCSepa',
  'generateEthereumEIP681',
  'generateHKQR',
  'generateJPQR',
  'generateLightning',
  'generatePayNow',
  'generatePayPalMe',
  'generatePIX',
  'generatePromptPay',
  'generateQRIS',
  'generateQRPh',
  'generateSwissQRBill',
  'generateTWQR',
  'generateUPI',
  'generateVietQR',
] as const;

// Enterprise generators
export const ENTERPRISE_API = ['generateGS1DigitalLink', 'generateOTPAuth'] as const;

// Social/Messaging generators
export const SOCIAL_API = [
  'generateAppDeepLink',
  'generateMessagingLink',
  'generateSocialProfile',
] as const;

// EMV QR Builder
export const EMV_API = ['EMVQRBuilder', 'parseEMVQR', 'validateEMVQRCRC'] as const;

// Utilities
export const UTILS_API = ['crc16CCITT', 'escapeValue', 'formatICalDate', 'utf8ByteLength'] as const;

// Constants
export const CONSTANTS = ['ISO_CURRENCY', 'PAYMENT_SCHEME_GUI'] as const;

// All public exports
export const PUBLIC_API = [
  ...CORE_API,
  ...CONTACT_API,
  ...CALENDAR_API,
  ...PAYMENT_API,
  ...ENTERPRISE_API,
  ...SOCIAL_API,
  ...EMV_API,
  ...UTILS_API,
  ...CONSTANTS,
] as const;
