/**
 * Payload Generators Module
 * Re-exports payload generation functionality from payload-generators/ subdirectory
 */

export {
  generateUrl,
  generateEmail,
  generateTel,
  generateSms,
  generateWifi,
  generateVCard,
  generateMeCard,
  generateGeo,
  generateEvent,
  generateCrypto,
  generateBizCard,
  generateCalendarSubscription,
  generateEPCSepa,
  generateGS1DigitalLink,
  generateMessagingLink,
  generateOTPAuth,
  generatePayNow,
  generatePIX,
  generatePromptPay,
  generateUPI,
  generateSocialProfile,
  generateAppDeepLink,
  PayloadGenerators,
  type BizCardParams,
  type EPCSepaParams,
  type GS1DigitalLinkParams,
  type OTPAuthParams,
  type PayNowParams,
  type PIXParams,
  type PromptPayParams,
  type UPIParams,
} from './payload-generators/';

export default PayloadGenerators;
