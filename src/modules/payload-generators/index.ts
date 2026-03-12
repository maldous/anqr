/**
 * Payload Generators Module
 * Re-exports from split module files
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('PAYLOAD');

// Calendar generators
export { generateCalendarSubscription, generateEvent } from '../../domain/payload/calendar';
// Contact generators
export { generateBizCard, generateMeCard, generateVCard } from '../../domain/payload/contacts';
// Core generators
export {
  generateEmail,
  generateGeo,
  generateSms,
  generateTel,
  generateUrl,
  generateWifi,
} from './core';
// EMV QR Builder
export { EMVQRBuilder, parseEMVQR, validateEMVQRCRC } from '../../domain/payload/emv';
// Enterprise generators
export { generateGS1DigitalLink, generateOTPAuth } from '../../domain/payload/enterprise';
// Payment generators
export {
  generateAusPayNet,
  generateBharatQR,
  generateCashApp,
  generateCrypto,
  generateDuitNow,
  generateEMVMPM,
  generateEPCSepa,
  generateEthereumEIP681,
  generateHKQR,
  generateJPQR,
  generateLightning,
  generatePayNow,
  generatePayPalMe,
  generatePIX,
  generatePromptPay,
  generateQRIS,
  generateQRPh,
  generateSwissQRBill,
  generateTWQR,
  generateUPI,
  generateVietQR,
} from '../../domain/payload/payments';
// Social/Messaging generators
export { generateAppDeepLink, generateMessagingLink, generateSocialProfile } from '../../domain/payload/social';
// Types and constants (canonical source - store imports from here)
export * from './types';
export { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from './types';
export {
  crc16CCITT,
  escapeValue,
  formatICalDate,
  isNonEmpty,
  isValidABN,
  isValidAccountNumber,
  isValidAmount,
  isValidBankBin,
  isValidBSB,
  isValidCashtag,
  isValidCountryCode,
  isValidCryptoAddress,
  isValidCurrencyCode,
  isValidEmail,
  isValidEthereumAddress,
  isValidFpsId,
  isValidGTIN,
  isValidIBAN,
  isValidLatitude,
  isValidLightningInvoice,
  isValidLongitude,
  isValidMerchantId,
  isValidPayPalUsername,
  isValidPhone,
  isValidProxyValue,
  isValidSSID,
  isValidStoreId,
  isValidUpiVpa,
  isValidUrl,
  isValidUrlWithScheme,
  utf8ByteLength,
} from './utils';
