/**
 * Payload Generators Module
 * Re-exports from split module files
 */

// Types and constants (canonical source - store imports from here)
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


