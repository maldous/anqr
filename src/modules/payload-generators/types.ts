/**
 * Payload Generators Types and Constants
 * 
 * These types are defined locally to avoid coupling to the app store.
 * The store imports from here, not the other way around.
 */

// ============================================
// HELPER TYPES (local definitions - no store dependency)
// ============================================

/** URL helper for constructing URLs with UTM parameters */
export interface UrlHelper {
  href: string;
  forceHttps: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

/** Telephone number helper */
export interface TelHelper {
  number: string;
}

/** Email helper for mailto: links */
export interface EmailHelper {
  to: string;
  subject?: string;
  body?: string;
}

/** SMS helper for sms: links */
export interface SmsHelper {
  number: string;
  body?: string;
}

/** Geographic coordinates helper */
export interface GeoHelper {
  lat: number;
  lon: number;
  query?: string;
}

/** WiFi authentication types */
export type WifiAuth = 'WPA' | 'WPA2' | 'WPA3' | 'WEP' | 'nopass';

/** WiFi network configuration helper */
export interface WifiHelper {
  ssid: string;
  auth: WifiAuth;
  password?: string;
  hidden: boolean;
  eapIdentity?: string;
  eapAnonymous?: string;
  eapPhase2?: string;
  eapCaCert?: string;
}

/** vCard version */
export type VCardVersion = '2.1' | '3.0' | '4.0';

/** vCard contact helper */
export interface VCardHelper {
  version: VCardVersion;
  fn?: string;
  n?: string;
  org?: string;
  title?: string;
  tel?: string[];
  email?: string[];
  url?: string;
  adr?: string[];
  note?: string;
  photo?: string;
  bday?: string;
  role?: string;
  impp?: string;
  uid?: string;
}

/** MeCard contact helper (simpler than vCard) */
export interface MeCardHelper {
  n?: string;
  tel?: string;
  email?: string;
  adr?: string;
  org?: string;
  url?: string;
  note?: string;
  bday?: string;
  nickname?: string;
}

/** Calendar event helper */
export interface EventHelper {
  summary?: string;
  location?: string;
  description?: string;
  start?: string;
  end?: string;
  tz?: string;
  rrule?: string;
}

/** Cryptocurrency payment helper */
export interface CryptoHelper {
  type: string;
  address: string;
  amount?: number;
  label?: string;
}

// ============================================
// EMV QR CODE CONSTANTS
// ============================================

export const EMV_TAGS = {
  PAYLOAD_FORMAT_INDICATOR: '00',
  POINT_OF_INITIATION: '01',
  VISA: '02',
  MASTERCARD: '03',
  MASTERCARD_2: '04',
  MASTERCARD_3: '05',
  MERCHANT_ACCOUNT_INFO_START: 26,
  MERCHANT_ACCOUNT_INFO_END: 51,
  MERCHANT_CATEGORY_CODE: '52',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  TIP_INDICATOR: '55',
  TIP_FIXED: '56',
  TIP_PERCENTAGE: '57',
  COUNTRY_CODE: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  POSTAL_CODE: '61',
  ADDITIONAL_DATA: '62',
  CRC: '63',
  MERCHANT_INFO_LANGUAGE: '64',
} as const;

export const POI_METHOD = {
  STATIC: '11',
  DYNAMIC: '12',
} as const;

export const TIP_INDICATOR = {
  NOT_SUPPORTED: '00',
  PROMPT_MOBILE: '01',
  FIXED_VALUE: '02',
  PERCENTAGE: '03',
} as const;

export const ADDITIONAL_DATA_TAGS = {
  BILL_NUMBER: '01',
  MOBILE_NUMBER: '02',
  STORE_LABEL: '03',
  LOYALTY_NUMBER: '04',
  REFERENCE_LABEL: '05',
  CUSTOMER_LABEL: '06',
  TERMINAL_LABEL: '07',
  PURPOSE_OF_TRANSACTION: '08',
  ADDITIONAL_CONSUMER_DATA: '09',
} as const;

export const MAI_SUBTAGS = {
  GLOBALLY_UNIQUE_ID: '00',
} as const;

export const ISO_CURRENCY = {
  AUD: '036',
  BRL: '986',
  CNY: '156',
  EUR: '978',
  GBP: '826',
  HKD: '344',
  IDR: '360',
  INR: '356',
  JPY: '392',
  MYR: '458',
  PHP: '608',
  SGD: '702',
  THB: '764',
  TWD: '901',
  USD: '840',
  VND: '704',
} as const;

export const PAYMENT_SCHEME_GUI = {
  PIX: 'br.gov.bcb.pix',
  PAYNOW: 'SG.PAYNOW',
  PROMPTPAY_MOBILE: 'A000000677010111',
  PROMPTPAY_TAX_ID: 'A000000677010112',
  PROMPTPAY_EWALLET: 'A000000677010114',
  PROMPTPAY_BILLPAY: 'A000000677010113',
  QRIS: 'ID.CO.QRIS.WWW',
  DUITNOW: 'MY.COM.DUITNOW',
  QRPH: 'PH.PPMI.P2M',
  VIETQR: 'VN.VIETQR',
  BHARATQR: 'IN.NPCI.BHARATQR',
  HKFPS: 'HK.COM.HKICL',
  TWQR: 'TW.FI.TWQR',
  JPQR: 'JP.OR.JPQR',
  AUSPAYNET: 'AU.COM.NPPA',
} as const;

// ============================================
// PAYMENT INTERFACES
// ============================================

export interface EPCSepaParams {
  name: string;
  iban: string;
  bic?: string;
  amount?: number;
  reference?: string;
  text?: string;
}

export interface UPIParams {
  pa: string;
  pn?: string;
  am?: number;
  cu?: string;
  tn?: string;
  tr?: string;
  mc?: string;
  tid?: string;
  url?: string;
  mode?: '00' | '01' | '02' | '03' | '04' | '05' | '06';
  purpose?: string;
  orgid?: string;
  sign?: string;
}

export interface PayNowParams {
  type: 'mobile' | 'uen' | 'nric';
  value: string;
  amount?: number;
  reference?: string;
  editable: boolean;
  expiryDate?: string;
  merchantName?: string;
  merchantCity?: string;
}

export interface PromptPayParams {
  type: 'mobile' | 'id' | 'ewallet' | 'billpay';
  value: string;
  amount?: number;
  merchantName?: string;
  merchantCity?: string;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  mcc?: string;
  countryCode?: string;
}

export interface PIXParams {
  key: string;
  name?: string;
  city?: string;
  amount?: number;
  txid?: string;
  description?: string;
  postalCode?: string;
  url?: string;
}

export interface GS1DigitalLinkParams {
  gtin: string;
  baseUrl?: string;
  lot?: string;
  ser?: string;
  expiry?: string;
}

export interface SwissQRBillParams {
  version?: '0200' | '0201';
  coding?: 1;
  creditorIBAN: string;
  creditorAddressType: 'S' | 'K';
  creditorName: string;
  creditorStreet?: string;
  creditorBuildingNumber?: string;
  creditorPostalCode?: string;
  creditorCity?: string;
  creditorCountry: string;
  ultimateCreditorAddressType?: 'S' | 'K';
  ultimateCreditorName?: string;
  ultimateCreditorStreet?: string;
  ultimateCreditorBuildingNumber?: string;
  ultimateCreditorPostalCode?: string;
  ultimateCreditorCity?: string;
  ultimateCreditorCountry?: string;
  amount?: number;
  currency: 'CHF' | 'EUR';
  ultimateDebtorAddressType?: 'S' | 'K';
  ultimateDebtorName?: string;
  ultimateDebtorStreet?: string;
  ultimateDebtorBuildingNumber?: string;
  ultimateDebtorPostalCode?: string;
  ultimateDebtorCity?: string;
  ultimateDebtorCountry?: string;
  referenceType: 'QRR' | 'SCOR' | 'NON';
  reference?: string;
  unstructuredMessage?: string;
  trailer?: 'EPD';
  billInformation?: string;
  alternativeProcedure1?: string;
  alternativeProcedure2?: string;
}

export interface LightningParams {
  invoice: string;
}

export interface EthereumEIP681Params {
  targetAddress: string;
  chainId?: number;
  functionName?: string;
  value?: string;
  gas?: number;
  gasLimit?: number;
  gasPrice?: string;
  tokenAddress?: string;
  tokenValue?: string;
  functionParams?: Record<string, string>;
}

export interface EMVMPMParams {
  merchantName: string;
  merchantCity: string;
  countryCode: string;
  currencyCode: string;
  amount?: number;
  isStatic?: boolean;
  mcc?: string;
  postalCode?: string;
  tipIndicator?: '01' | '02' | '03';
  tipFixed?: number;
  tipPercentage?: number;
  billNumber?: string;
  mobileNumber?: string;
  storeLabel?: string;
  loyaltyNumber?: string;
  referenceLabel?: string;
  customerLabel?: string;
  terminalLabel?: string;
  purposeOfTransaction?: string;
  merchantAccounts?: EMVMerchantAccount[];
}

export interface EMVMerchantAccount {
  tag: number;
  gui: string;
  data: Array<{ tag: string; value: string }>;
}

export interface QRISParams {
  merchantPAN?: string;
  merchantID: string;
  merchantCriteria?: '00' | '01' | '02' | '03';
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  amount?: number;
  feeType?: 'FIXED' | 'PERCENT';
  feeAmount?: number;
  terminalLabel?: string;
  nmid?: string;
}

export interface DuitNowParams {
  proxyType: 'NRIC' | 'MOBILE' | 'PASSPORT' | 'ARMY' | 'BUSINESS' | 'OTHERS';
  proxyValue: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}

export interface BharatQRParams {
  merchantVPA?: string;
  merchantPAN?: string;
  merchantID?: string;
  merchantName: string;
  merchantCity: string;
  mcc?: string;
  amount?: number;
  gstDetails?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  terminalId?: string;
}

export interface VietQRParams {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  serviceCode?: 'QRPUSH' | 'QRIBFTTA' | 'QRIBFTTC';
}

export interface QRPhParams {
  accountNumber: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  reference?: string;
}

export interface TWQRParams {
  merchantId: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  taxId?: string;
}

export interface HKQRParams {
  fpsId?: string;
  mobileNumber?: string;
  email?: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}

export interface JPQRParams {
  storeId: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
}

export interface AusPayNetParams {
  payId?: string;
  payIdType?: 'EMAIL' | 'MOBILE' | 'ABN' | 'ORG';
  bsb?: string;
  accountNumber?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}

export interface PayPalMeParams {
  username: string;
  amount?: number;
  currencyCode?: string;
}

export interface CashAppParams {
  cashtag: string;
  amount?: number;
}

export interface BizCardParams {
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface OTPAuthParams {
  type: 'totp' | 'hotp';
  issuer?: string;
  account?: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  counter?: number;
}
