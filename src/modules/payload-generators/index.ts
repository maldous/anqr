/**
 * Payload Generators Module
 * Re-exports from split module files
 */

// Types and constants
export * from './types';
export { utf8ByteLength, crc16CCITT, escapeValue, formatICalDate } from './utils';

// EMV QR Builder
export { EMVQRBuilder, parseEMVQR, validateEMVQRCRC } from './emv';
export { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from './types';

// Core generators
export { generateUrl, generateTel, generateEmail, generateSms, generateGeo, generateWifi } from './core';

// Contact generators
export { generateVCard, generateMeCard, generateBizCard } from './contacts';

// Calendar generators
export { generateEvent, generateCalendarSubscription } from './calendar';

// Payment generators
export {
  generateEPCSepa,
  generateUPI,
  generatePayNow,
  generatePromptPay,
  generatePIX,
  generateSwissQRBill,
  generateLightning,
  generateEthereumEIP681,
  generateCrypto,
  generatePayPalMe,
  generateCashApp,
  generateQRIS,
  generateDuitNow,
  generateBharatQR,
  generateVietQR,
  generateQRPh,
  generateTWQR,
  generateHKQR,
  generateJPQR,
  generateAusPayNet,
  generateEMVMPM,
} from './payments';

// Enterprise generators
export { generateGS1DigitalLink, generateOTPAuth } from './enterprise';

// Social/Messaging generators
export { generateSocialProfile, generateMessagingLink, generateAppDeepLink } from './social';

// Import for default export
import { generateUrl, generateTel, generateEmail, generateSms, generateGeo, generateWifi } from './core';
import { generateVCard, generateMeCard, generateBizCard } from './contacts';
import { generateEvent, generateCalendarSubscription } from './calendar';
import {
  generateEPCSepa,
  generateUPI,
  generatePayNow,
  generatePromptPay,
  generatePIX,
  generateSwissQRBill,
  generateLightning,
  generateEthereumEIP681,
  generateCrypto,
  generatePayPalMe,
  generateCashApp,
  generateQRIS,
  generateDuitNow,
  generateBharatQR,
  generateVietQR,
  generateQRPh,
  generateTWQR,
  generateHKQR,
  generateJPQR,
  generateAusPayNet,
  generateEMVMPM,
} from './payments';
import { generateGS1DigitalLink, generateOTPAuth } from './enterprise';
import { generateSocialProfile, generateMessagingLink, generateAppDeepLink } from './social';

// Default export object for backwards compatibility
export const PayloadGenerators = {
  // Core
  url: generateUrl,
  tel: generateTel,
  email: generateEmail,
  sms: generateSms,
  geo: generateGeo,
  wifi: generateWifi,

  // Contact
  vcard: generateVCard,
  mecard: generateMeCard,
  bizcard: generateBizCard,

  // Calendar
  event: generateEvent,
  calendarSubscription: generateCalendarSubscription,

  // Payments - EU/International
  epcSepa: generateEPCSepa,
  swissQRBill: generateSwissQRBill,

  // Payments - Asia-Pacific
  upi: generateUPI,
  bharatqr: generateBharatQR,
  paynow: generatePayNow,
  promptpay: generatePromptPay,
  pix: generatePIX,
  qris: generateQRIS,
  duitnow: generateDuitNow,
  vietqr: generateVietQR,
  qrph: generateQRPh,
  twqr: generateTWQR,
  hkqr: generateHKQR,
  jpqr: generateJPQR,
  auspaynet: generateAusPayNet,

  // Payments - Crypto
  crypto: generateCrypto,
  lightning: generateLightning,
  ethereumEIP681: generateEthereumEIP681,

  // Payments - Links
  paypalme: generatePayPalMe,
  cashapp: generateCashApp,

  // Generic EMV
  emvmpm: generateEMVMPM,

  // Enterprise
  gs1DigitalLink: generateGS1DigitalLink,
  otpauth: generateOTPAuth,

  // Social/Messaging
  socialProfile: generateSocialProfile,
  messagingLink: generateMessagingLink,
  appDeepLink: generateAppDeepLink,
};

export default PayloadGenerators;
