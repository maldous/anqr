import { OpenLocationCode } from 'open-location-code';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimePicker } from '@/ui/primitives/date-time-picker';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { HelpLink } from '@/ui/primitives/help-link';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import { Switch } from '@/ui/primitives/switch';
import { Textarea } from '@/ui/primitives/textarea';
import i18n from '@/app/i18n';
import { createLogger } from '@/infra/logging/logger';
import { HighlightedLabel } from '@/app/search/search-context';

import {
  generateEPCSepa,
  generateMessagingLink,
  generatePayNow,
  generatePIX,
  generatePromptPay,
  generateSocialProfile,
  generateUPI,
  isNonEmpty,
  isValidABN,
  isValidAccountNumber,
  isValidBankBin,
  isValidCashtag,
  isValidCryptoAddress,
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
} from '@/modules/payload-generators';
import { ECC_CAPACITIES_BYTE } from '@/modules/qr-spec';
import { type PayloadKind, type QRState, useQRStore } from '@/store/qr-store';
import {
  BizcardEditor,
  EmailEditor,
  MecardEditor,
  SmsEditor,
  VcardEditor,
  WifiEditor,
} from './payload-editors';
import type {
  AusPayNetForm,
  BharatQRForm,
  CashAppForm,
  DuitNowForm,
  EMVGenericForm,
  EPCSepaForm,
  EthereumForm,
  HKQRForm,
  JPQRForm,
  LightningForm,
  PayNowForm,
  PayPalMeForm,
  PIXForm,
  PromptPayForm,
  QRISForm,
  QRPhForm,
  ShortLinkForm,
  SwissQRBillForm,
  TWQRForm,
  UPIForm,
  VietQRForm,
} from './payload-section-types';

const log = createLogger('PAYLOAD');

// Global payment methods available to ALL languages in advanced tier
const GLOBAL_PAYMENT_METHODS: PayloadKind[] = [
  'crypto',
  'lightning',
  'ethereum_eip681',
  'paypal_me',
  'cashapp',
];

// Language-to-payment mapping for advanced tier
// Maps language codes to arrays of region-specific payment methods
const LANGUAGE_PAYMENT_MAP: Record<string, PayloadKind[]> = {
  // === English variants ===
  'en-GB': ['epc_sepa'], // UK - SEPA compatible
  'en-US': [], // USA - global payments only
  'en-AU': ['auspaynet'], // Australia - NPP/PayID
  'en-CA': [], // Canada - global payments only
  'en-IN': ['upi', 'bharatqr'], // India
  'en-SG': ['paynow'], // Singapore
  'en-ZA': [], // South Africa - global payments only

  // === East Asian ===
  // Vietnamese - VietQR
  vi: ['vietqr'],

  // Thai - PromptPay
  th: ['promptpay'],

  // Japanese - JPQR (Google Play: ja-JP)
  'ja-JP': ['jpqr'],

  // Korean - global only (Google Play: ko-KR)
  'ko-KR': [],

  // Chinese variants
  'zh-CN': [], // Mainland China - global only (WeChat/Alipay not supported)
  'zh-HK': ['hkqr'], // Hong Kong - FPS
  'zh-TW': ['twqr'], // Taiwan

  // === Southeast Asian ===
  // Indonesian - QRIS
  id: ['qris'],

  // Malay (Malaysia, Singapore) - DuitNow, PayNow
  ms: ['duitnow', 'paynow'],
  'ms-MY': ['duitnow', 'paynow'], // Malaysia variant

  // Filipino (Philippines) - QR Ph (Google Play: fil)
  fil: ['qrph'],

  // Khmer (Cambodia) - global only
  'km-KH': [],

  // Lao - global only
  'lo-LA': [],

  // Burmese - global only
  'my-MM': [],

  // === South Asian ===
  // Indian languages - UPI, BharatQR (Google Play codes)
  'hi-IN': ['upi', 'bharatqr'],
  'bn-BD': ['upi', 'bharatqr'], // Bengali
  'te-IN': ['upi', 'bharatqr'],
  'mr-IN': ['upi', 'bharatqr'],
  gu: ['upi', 'bharatqr'],
  'kn-IN': ['upi', 'bharatqr'],
  'ml-IN': ['upi', 'bharatqr'],
  pa: ['upi', 'bharatqr'], // Punjabi
  'ta-IN': ['upi', 'bharatqr'],

  // Nepali - UPI (close ties with India)
  'ne-NP': ['upi', 'bharatqr'],

  // Sinhala (Sri Lanka) - global only
  'si-LK': [],

  // Urdu (Pakistan) - global only
  ur: [],

  // === Latin America ===
  // Portuguese (Brazil) - PIX
  'pt-BR': ['pix'],

  // Spanish (Latin America) - global only
  'es-419': [],
  'es-US': [],

  // === European SEPA countries ===
  // Western Europe
  'de-DE': ['epc_sepa', 'swiss_qr_bill'], // German (Germany, Austria, Switzerland)
  'fr-FR': ['epc_sepa', 'swiss_qr_bill'], // French (France, Switzerland)
  'fr-CA': [], // French (Canada) - global only
  'it-IT': ['epc_sepa', 'swiss_qr_bill'], // Italian (Italy, Switzerland)
  'es-ES': ['epc_sepa'], // Spanish (Spain)
  'pt-PT': ['epc_sepa'], // Portuguese (Portugal)
  'nl-NL': ['epc_sepa'], // Dutch

  // Spanish regional languages
  ca: ['epc_sepa'], // Catalan
  'eu-ES': ['epc_sepa'], // Basque
  'gl-ES': ['epc_sepa'], // Galician

  // Nordic countries
  'da-DK': ['epc_sepa'], // Danish
  'fi-FI': ['epc_sepa'], // Finnish
  'sv-SE': ['epc_sepa'], // Swedish
  'no-NO': ['epc_sepa'], // Norwegian
  'is-IS': ['epc_sepa'], // Icelandic (EEA/SEPA member)

  // Central Europe
  'pl-PL': ['epc_sepa'], // Polish
  'cs-CZ': ['epc_sepa'], // Czech
  sk: ['epc_sepa'], // Slovak
  'hu-HU': ['epc_sepa'], // Hungarian
  sl: ['epc_sepa'], // Slovenian

  // Baltic states
  et: ['epc_sepa'], // Estonian
  lt: ['epc_sepa'], // Lithuanian
  lv: ['epc_sepa'], // Latvian

  // Southern Europe
  'el-GR': ['epc_sepa'], // Greek
  hr: ['epc_sepa'], // Croatian
  ro: ['epc_sepa'], // Romanian
  bg: ['epc_sepa'], // Bulgarian

  // Switzerland
  rm: ['epc_sepa', 'swiss_qr_bill'], // Romansh

  // === Eastern European (non-SEPA) ===
  'ru-RU': ['epc_sepa'], // Russian - SEPA for cross-border
  uk: [], // Ukrainian - global only
  be: [], // Belarusian - global only
  sr: [], // Serbian - global only
  'mk-MK': [], // Macedonian - global only
  sq: [], // Albanian - global only

  // === Middle East & Central Asia ===
  // Arabic - global only
  ar: [],

  // Hebrew (Israel) - global only
  'iw-IL': [],

  // Persian variants - global only
  fa: [],
  'fa-AE': [],
  'fa-AF': [],
  'fa-IR': [],

  // Turkish - global only
  'tr-TR': [],

  // Central Asian - global only
  'az-AZ': [], // Azerbaijani
  'hy-AM': [], // Armenian
  'ka-GE': [], // Georgian
  kk: [], // Kazakh
  'ky-KG': [], // Kyrgyz
  'mn-MN': [], // Mongolian

  // === African ===
  // South African languages - global only
  af: [], // Afrikaans
  zu: [], // Zulu

  // Ethiopian - global only
  am: [], // Amharic

  // East African - global only
  sw: [], // Swahili
};

/**
 * Get payment methods available for the current language in advanced tier
 * Returns all payments for professional tier, filtered payments for advanced tier
 */
function getAvailablePayments(tier: string, currentLang: string): PayloadKind[] {
  // Professional tier gets ALL payment methods
  if (tier === 'professional') {
    return [
      'epc_sepa',
      'swiss_qr_bill',
      'upi',
      'paynow',
      'promptpay',
      'pix',
      'qris',
      'duitnow',
      'bharatqr',
      'vietqr',
      'qrph',
      'twqr',
      'hkqr',
      'jpqr',
      'auspaynet',
      'crypto',
      'lightning',
      'ethereum_eip681',
      'paypal_me',
      'cashapp',
      'emv_generic',
    ];
  }

  // Advanced tier gets language-specific + global payments
  if (tier === 'advanced') {
    // Try full language code first (e.g., 'ja-JP'), then fall back to base language (e.g., 'ja')
    const baseLang = currentLang.split('-')[0];
    const langSpecific = LANGUAGE_PAYMENT_MAP[currentLang] || LANGUAGE_PAYMENT_MAP[baseLang] || [];
    // Combine language-specific with global, remove duplicates
    return [...new Set([...langSpecific, ...GLOBAL_PAYMENT_METHODS])];
  }

  // Basic tier gets no payments
  return [];
}

// Payload category/item keys for translation
const PAYLOAD_CATEGORY_KEYS = [
  {
    groupKey: 'payload.core',
    tier: 'basic' as const,
    items: [
      { value: 'plain_text' as PayloadKind, labelKey: 'payload.plainText' },
      { value: 'url' as PayloadKind, labelKey: 'payload.url' },
    ],
  },
  {
    groupKey: 'payload.contact',
    tier: 'advanced' as const,
    items: [
      { value: 'tel' as PayloadKind, labelKey: 'payload.tel' },
      { value: 'email' as PayloadKind, labelKey: 'payload.email' },
      { value: 'sms' as PayloadKind, labelKey: 'payload.smsMms' },
      { value: 'vcard' as PayloadKind, labelKey: 'payload.vcard' },
      { value: 'mecard' as PayloadKind, labelKey: 'payload.mecard' },
      { value: 'bizcard' as PayloadKind, labelKey: 'payload.bizcard' },
    ],
  },
  {
    groupKey: 'payload.locationNetwork',
    tier: 'advanced' as const,
    items: [
      { value: 'geo' as PayloadKind, labelKey: 'payload.geo' },
      { value: 'wifi' as PayloadKind, labelKey: 'payload.wifiNetwork' },
    ],
  },
  {
    groupKey: 'payload.calendar',
    tier: 'advanced' as const,
    items: [
      { value: 'event' as PayloadKind, labelKey: 'payload.event' },
      { value: 'event_rsvp' as PayloadKind, labelKey: 'payload.eventRsvp' },
      { value: 'calendar_subscription' as PayloadKind, labelKey: 'payload.calendarSubscription' },
    ],
  },
  // Documents & Media category removed - file_url and cloud_link are just URLs
  // Users should use the URL payload type for document/cloud links
  {
    groupKey: 'payload.socialMessaging',
    tier: 'advanced' as const,
    items: [
      { value: 'social_profile' as PayloadKind, labelKey: 'payload.socialProfile' },
      { value: 'messaging_link' as PayloadKind, labelKey: 'payload.messagingLink' },
    ],
  },
  {
    groupKey: 'payload.payments',
    tier: 'advanced' as const, // Show in advanced tier with language filtering, all in professional
    items: [
      { value: 'epc_sepa' as PayloadKind, labelKey: 'payload.epcSepa' },
      { value: 'swiss_qr_bill' as PayloadKind, labelKey: 'payload.swissQrBill' },
      { value: 'upi' as PayloadKind, labelKey: 'payload.upi' },
      { value: 'paynow' as PayloadKind, labelKey: 'payload.paynow' },
      { value: 'promptpay' as PayloadKind, labelKey: 'payload.promptpay' },
      { value: 'pix' as PayloadKind, labelKey: 'payload.pix' },
      { value: 'qris' as PayloadKind, labelKey: 'payload.qris' },
      { value: 'duitnow' as PayloadKind, labelKey: 'payload.duitnow' },
      { value: 'bharatqr' as PayloadKind, labelKey: 'payload.bharatqr' },
      { value: 'vietqr' as PayloadKind, labelKey: 'payload.vietqr' },
      { value: 'qrph' as PayloadKind, labelKey: 'payload.qrph' },
      { value: 'twqr' as PayloadKind, labelKey: 'payload.twqr' },
      { value: 'hkqr' as PayloadKind, labelKey: 'payload.hkqr' },
      { value: 'jpqr' as PayloadKind, labelKey: 'payload.jpqr' },
      { value: 'auspaynet' as PayloadKind, labelKey: 'payload.auspaynet' },
      { value: 'crypto' as PayloadKind, labelKey: 'payload.crypto' },
      { value: 'lightning' as PayloadKind, labelKey: 'payload.lightning' },
      { value: 'ethereum_eip681' as PayloadKind, labelKey: 'payload.ethereumEip681' },
      { value: 'paypal_me' as PayloadKind, labelKey: 'payload.paypalMe' },
      { value: 'cashapp' as PayloadKind, labelKey: 'payload.cashapp' },
      { value: 'emv_generic' as PayloadKind, labelKey: 'payload.emvGeneric' },
    ],
  },
  {
    groupKey: 'payload.marketing',
    tier: 'professional' as const,
    items: [
      { value: 'utm_link' as PayloadKind, labelKey: 'payload.utmLink' },
      { value: 'short_link' as PayloadKind, labelKey: 'payload.shortLink' },
    ],
  },
  {
    groupKey: 'payload.enterprise',
    tier: 'professional' as const,
    items: [
      { value: 'gs1_digital_link' as PayloadKind, labelKey: 'payload.gs1DigitalLink' },
      { value: 'app_link' as PayloadKind, labelKey: 'payload.appLink' },
      { value: 'custom' as PayloadKind, labelKey: 'payload.custom' },
    ],
  },
];

// Plus Code Display component - uses proper import and useMemo
// Always renders with fallback to raw coordinates if Plus Code generation fails
// Generates SHORT Plus Codes that can be searched in Google Maps with a locality
function PlusCodeDisplay({
  lat,
  lon,
  t,
}: Readonly<{
  lat: number;
  lon: number;
  t: ReturnType<typeof useTranslation>['t'];
}>) {
  const { plusCode, shortCode, error } = useMemo(() => {
    try {
      // OpenLocationCode is a class that needs to be instantiated
      // Generate full Plus Code (10 character precision)
      // Full format: "4RJ65XP7+87" = area(4) + local(4) + "+" + suffix(2)
      // @ts-expect-error @types/open-location-code incorrectly declares encode as static, but it is an instance method at runtime
      const fullCode = new OpenLocationCode().encode(lat, lon, 10);

      // Generate SHORT Plus Code by finding the + sign and taking 4 chars before it
      // Short format: "5XP7+87" = local(4) + "+" + suffix(2)
      // This can be searched in Google Maps with a locality (e.g., "5XP7+87 Melbourne")
      const plusIndex = fullCode.indexOf('+');
      // Take 4 characters before the + sign, plus everything after (including +)
      const shortened = plusIndex >= 4 ? fullCode.substring(plusIndex - 4) : fullCode;

      // Debug logging to help diagnose issues
      log.debug('Plus Code debug', { lat, lon, fullCode, plusIndex, shortCode: shortened });

      return { plusCode: fullCode, shortCode: shortened, error: null };
    } catch (e) {
      log.error('Plus Code generation error', { error: e });
      return {
        plusCode: null,
        shortCode: null,
        error: e instanceof Error ? e.message : 'Failed to generate Plus Code',
      };
    }
  }, [lat, lon]);

  // Always generate a Google Maps URL - use full Plus Code for accuracy, otherwise coordinates
  const googleMapsUrl = plusCode
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  // Display the SHORT code (can be searched with locality in Google Maps)
  const displayText = shortCode || plusCode || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  // ALWAYS render - never return null
  return (
    <div className="space-y-2 pt-2 border-t">
      <Label>
        <HighlightedLabel>
          {plusCode ? t('payload.plusCode', 'Plus Code') : t('payload.coordinates', 'Coordinates')}
        </HighlightedLabel>
      </Label>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
          {displayText}
        </code>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
        >
          {t('actions.open', 'Open')}
        </a>
      </div>
      {error ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('hints.plusCodeFallback', 'Plus Code unavailable, using coordinates.')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t(
            'hints.plusCodeShort',
            `Short Plus Code - search in Google Maps with a city name (e.g., "${displayText} Melbourne").`
          )}
        </p>
      )}
    </div>
  );
}

function usePaymentFormStates() {
  const [epcSepaForm, setEpcSepaForm] = useState<EPCSepaForm>({
    name: '',
    iban: '',
    bic: '',
    amount: '',
    reference: '',
  });

  const [upiForm, setUpiForm] = useState<UPIForm>({
    vpa: '',
    payeeName: '',
    amount: '',
    transactionNote: '',
  });

  const [payNowForm, setPayNowForm] = useState<PayNowForm>({
    type: 'uen',
    value: '',
    amount: '',
    reference: '',
  });

  const [promptPayForm, setPromptPayForm] = useState<PromptPayForm>({
    type: 'mobile',
    value: '',
    amount: '',
  });

  const [pixForm, setPixForm] = useState<PIXForm>({
    key: '',
    name: '',
    city: '',
    amount: '',
  });

  const [swissQrBillForm, setSwissQrBillForm] = useState<SwissQRBillForm>({
    creditorIBAN: '',
    creditorName: '',
    creditorCity: '',
    creditorCountry: 'CH',
    referenceType: 'NON',
    reference: '',
    amount: '',
    currency: 'CHF',
  });

  const [lightningForm, setLightningForm] = useState<LightningForm>({
    invoice: '',
  });

  const [ethereumForm, setEthereumForm] = useState<EthereumForm>({
    targetAddress: '',
    chainId: '1',
    value: '',
    gas: '',
  });

  const [qrisForm, setQrisForm] = useState<QRISForm>({
    merchantId: '',
    merchantName: '',
    merchantCity: '',
    amount: '',
  });

  const [duitnowForm, setDuitnowForm] = useState<DuitNowForm>({
    proxyType: 'MOBILE',
    proxyValue: '',
    merchantName: '',
    amount: '',
  });

  const [bharatqrForm, setBharatqrForm] = useState<BharatQRForm>({
    merchantVPA: '',
    merchantName: '',
    merchantCity: '',
    amount: '',
  });

  const [vietqrForm, setVietqrForm] = useState<VietQRForm>({
    bankBin: '',
    accountNumber: '',
    accountName: '',
    amount: '',
  });

  const [qrphForm, setQrphForm] = useState<QRPhForm>({
    accountNumber: '',
    merchantName: '',
    merchantCity: '',
    amount: '',
  });

  const [twqrForm, setTwqrForm] = useState<TWQRForm>({
    merchantId: '',
    merchantName: '',
    amount: '',
  });

  const [hkqrForm, setHkqrForm] = useState<HKQRForm>({
    fpsId: '',
    merchantName: '',
    amount: '',
  });

  const [jpqrForm, setJpqrForm] = useState<JPQRForm>({
    storeId: '',
    merchantName: '',
    amount: '',
  });

  const [auspaynetForm, setAuspaynetForm] = useState<AusPayNetForm>({
    payId: '',
    payIdType: 'EMAIL',
    merchantName: '',
    amount: '',
  });

  const [paypalMeForm, setPaypalMeForm] = useState<PayPalMeForm>({
    username: '',
    amount: '',
  });

  const [cashappForm, setCashappForm] = useState<CashAppForm>({
    cashtag: '',
    amount: '',
  });

  const [emvGenericForm, setEmvGenericForm] = useState<EMVGenericForm>({
    merchantName: '',
    merchantCity: '',
    countryCode: '',
    currencyCode: '',
    amount: '',
    mcc: '',
    postalCode: '',
    tipIndicator: 'none',
    tipAmount: '',
    tipPercent: '',
    reference: '',
    storeLabel: '',
    terminalLabel: '',
  });

  const [shortLinkForm, setShortLinkForm] = useState<ShortLinkForm>({
    longUrl: '',
    shortUrl: '',
    isLoading: false,
    error: '',
  });

  return {
    epcSepaForm,
    setEpcSepaForm,
    upiForm,
    setUpiForm,
    payNowForm,
    setPayNowForm,
    promptPayForm,
    setPromptPayForm,
    pixForm,
    setPixForm,
    swissQrBillForm,
    setSwissQrBillForm,
    lightningForm,
    setLightningForm,
    ethereumForm,
    setEthereumForm,
    qrisForm,
    setQrisForm,
    duitnowForm,
    setDuitnowForm,
    bharatqrForm,
    setBharatqrForm,
    vietqrForm,
    setVietqrForm,
    qrphForm,
    setQrphForm,
    twqrForm,
    setTwqrForm,
    hkqrForm,
    setHkqrForm,
    jpqrForm,
    setJpqrForm,
    auspaynetForm,
    setAuspaynetForm,
    paypalMeForm,
    setPaypalMeForm,
    cashappForm,
    setCashappForm,
    emvGenericForm,
    setEmvGenericForm,
    shortLinkForm,
    setShortLinkForm,
  };
}

function usePaymentFormSync(
  payloadKind: PayloadKind,
  forms: {
    epcSepaForm: EPCSepaForm;
    upiForm: UPIForm;
    payNowForm: PayNowForm;
    promptPayForm: PromptPayForm;
    pixForm: PIXForm;
    swissQrBillForm: SwissQRBillForm;
    lightningForm: LightningForm;
    ethereumForm: EthereumForm;
    qrisForm: QRISForm;
    duitnowForm: DuitNowForm;
    bharatqrForm: BharatQRForm;
    vietqrForm: VietQRForm;
    qrphForm: QRPhForm;
    twqrForm: TWQRForm;
    hkqrForm: HKQRForm;
    jpqrForm: JPQRForm;
    auspaynetForm: AusPayNetForm;
    paypalMeForm: PayPalMeForm;
    cashappForm: CashAppForm;
    emvGenericForm: EMVGenericForm;
  },
  setters: {
    setPayloadText: QRState['setPayloadText'];
    setPayloadSwissQRBill: QRState['setPayloadSwissQRBill'];
    setPayloadLightning: QRState['setPayloadLightning'];
    setPayloadEthereum: QRState['setPayloadEthereum'];
    setPayloadQRIS: QRState['setPayloadQRIS'];
    setPayloadDuitNow: QRState['setPayloadDuitNow'];
    setPayloadBharatQR: QRState['setPayloadBharatQR'];
    setPayloadVietQR: QRState['setPayloadVietQR'];
    setPayloadQRPh: QRState['setPayloadQRPh'];
    setPayloadTWQR: QRState['setPayloadTWQR'];
    setPayloadHKQR: QRState['setPayloadHKQR'];
    setPayloadJPQR: QRState['setPayloadJPQR'];
    setPayloadAusPayNet: QRState['setPayloadAusPayNet'];
    setPayloadPayPalMe: QRState['setPayloadPayPalMe'];
    setPayloadCashApp: QRState['setPayloadCashApp'];
    setPayloadEMVGeneric: QRState['setPayloadEMVGeneric'];
  }
) {
  const {
    epcSepaForm,
    upiForm,
    payNowForm,
    promptPayForm,
    pixForm,
    swissQrBillForm,
    lightningForm,
    ethereumForm,
    qrisForm,
    duitnowForm,
    bharatqrForm,
    vietqrForm,
    qrphForm,
    twqrForm,
    hkqrForm,
    jpqrForm,
    auspaynetForm,
    paypalMeForm,
    cashappForm,
    emvGenericForm,
  } = forms;

  const {
    setPayloadText,
    setPayloadSwissQRBill,
    setPayloadLightning,
    setPayloadEthereum,
    setPayloadQRIS,
    setPayloadDuitNow,
    setPayloadBharatQR,
    setPayloadVietQR,
    setPayloadQRPh,
    setPayloadTWQR,
    setPayloadHKQR,
    setPayloadJPQR,
    setPayloadAusPayNet,
    setPayloadPayPalMe,
    setPayloadCashApp,
    setPayloadEMVGeneric,
  } = setters;

  useEffect(() => {
    if (payloadKind === 'epc_sepa' && epcSepaForm.name && epcSepaForm.iban) {
      const generated = generateEPCSepa({
        name: epcSepaForm.name,
        iban: epcSepaForm.iban,
        bic: epcSepaForm.bic || undefined,
        amount: epcSepaForm.amount ? Number.parseFloat(epcSepaForm.amount) : undefined,
        reference: epcSepaForm.reference || undefined,
      });
      setPayloadText(generated);
    }
  }, [payloadKind, epcSepaForm, setPayloadText]);

  useEffect(() => {
    if (payloadKind === 'upi' && upiForm.vpa) {
      const generated = generateUPI({
        pa: upiForm.vpa,
        pn: upiForm.payeeName || undefined,
        am: upiForm.amount ? Number.parseFloat(upiForm.amount) : undefined,
        tn: upiForm.transactionNote || undefined,
      });
      setPayloadText(generated);
    }
  }, [payloadKind, upiForm, setPayloadText]);

  useEffect(() => {
    if (payloadKind === 'paynow' && payNowForm.value) {
      const generated = generatePayNow({
        type: payNowForm.type,
        value: payNowForm.value,
        amount: payNowForm.amount ? Number.parseFloat(payNowForm.amount) : undefined,
        reference: payNowForm.reference || undefined,
        editable: true,
      });
      setPayloadText(generated);
    }
  }, [payloadKind, payNowForm, setPayloadText]);

  useEffect(() => {
    if (payloadKind === 'promptpay' && promptPayForm.value) {
      const generated = generatePromptPay({
        type: promptPayForm.type,
        value: promptPayForm.value,
        amount: promptPayForm.amount ? Number.parseFloat(promptPayForm.amount) : undefined,
      });
      setPayloadText(generated);
    }
  }, [payloadKind, promptPayForm, setPayloadText]);

  useEffect(() => {
    if (payloadKind === 'pix' && pixForm.key) {
      const generated = generatePIX({
        key: pixForm.key,
        name: pixForm.name || undefined,
        city: pixForm.city || undefined,
        amount: pixForm.amount ? Number.parseFloat(pixForm.amount) : undefined,
      });
      setPayloadText(generated);
    }
  }, [payloadKind, pixForm, setPayloadText]);

  useEffect(() => {
    if (payloadKind !== 'swiss_qr_bill') return;
    setPayloadSwissQRBill({
      creditorIBAN: swissQrBillForm.creditorIBAN,
      creditorAddressType: 'K',
      creditorName: swissQrBillForm.creditorName,
      creditorCity: swissQrBillForm.creditorCity || undefined,
      creditorCountry: swissQrBillForm.creditorCountry,
      amount: swissQrBillForm.amount ? Number.parseFloat(swissQrBillForm.amount) : undefined,
      currency: swissQrBillForm.currency,
      referenceType: swissQrBillForm.referenceType,
      reference: swissQrBillForm.reference || undefined,
    });
  }, [payloadKind, swissQrBillForm, setPayloadSwissQRBill]);

  useEffect(() => {
    if (payloadKind !== 'lightning') return;
    setPayloadLightning({ invoice: lightningForm.invoice });
  }, [payloadKind, lightningForm, setPayloadLightning]);

  useEffect(() => {
    if (payloadKind !== 'ethereum_eip681') return;
    setPayloadEthereum({
      targetAddress: ethereumForm.targetAddress,
      chainId: ethereumForm.chainId ? Number.parseInt(ethereumForm.chainId, 10) : undefined,
      value: ethereumForm.value || undefined,
      gas: ethereumForm.gas ? Number.parseInt(ethereumForm.gas, 10) : undefined,
    });
  }, [payloadKind, ethereumForm, setPayloadEthereum]);

  useEffect(() => {
    if (payloadKind !== 'qris') return;
    setPayloadQRIS({
      merchantId: qrisForm.merchantId,
      merchantName: qrisForm.merchantName,
      merchantCity: qrisForm.merchantCity,
      amount: qrisForm.amount ? Number.parseFloat(qrisForm.amount) : undefined,
    });
  }, [payloadKind, qrisForm, setPayloadQRIS]);

  useEffect(() => {
    if (payloadKind !== 'duitnow') return;
    setPayloadDuitNow({
      proxyType: duitnowForm.proxyType,
      proxyValue: duitnowForm.proxyValue,
      merchantName: duitnowForm.merchantName,
      amount: duitnowForm.amount ? Number.parseFloat(duitnowForm.amount) : undefined,
    });
  }, [payloadKind, duitnowForm, setPayloadDuitNow]);

  useEffect(() => {
    if (payloadKind !== 'bharatqr') return;
    setPayloadBharatQR({
      merchantVPA: bharatqrForm.merchantVPA || undefined,
      merchantName: bharatqrForm.merchantName,
      merchantCity: bharatqrForm.merchantCity,
      amount: bharatqrForm.amount ? Number.parseFloat(bharatqrForm.amount) : undefined,
    });
  }, [payloadKind, bharatqrForm, setPayloadBharatQR]);

  useEffect(() => {
    if (payloadKind !== 'vietqr') return;
    setPayloadVietQR({
      bankBin: vietqrForm.bankBin,
      accountNumber: vietqrForm.accountNumber,
      accountName: vietqrForm.accountName || undefined,
      amount: vietqrForm.amount ? Number.parseFloat(vietqrForm.amount) : undefined,
    });
  }, [payloadKind, vietqrForm, setPayloadVietQR]);

  useEffect(() => {
    if (payloadKind !== 'qrph') return;
    setPayloadQRPh({
      accountNumber: qrphForm.accountNumber,
      merchantName: qrphForm.merchantName,
      merchantCity: qrphForm.merchantCity,
      amount: qrphForm.amount ? Number.parseFloat(qrphForm.amount) : undefined,
    });
  }, [payloadKind, qrphForm, setPayloadQRPh]);

  useEffect(() => {
    if (payloadKind !== 'twqr') return;
    setPayloadTWQR({
      merchantId: twqrForm.merchantId,
      merchantName: twqrForm.merchantName,
      amount: twqrForm.amount ? Number.parseFloat(twqrForm.amount) : undefined,
    });
  }, [payloadKind, twqrForm, setPayloadTWQR]);

  useEffect(() => {
    if (payloadKind !== 'hkqr') return;
    setPayloadHKQR({
      fpsId: hkqrForm.fpsId || undefined,
      merchantName: hkqrForm.merchantName,
      amount: hkqrForm.amount ? Number.parseFloat(hkqrForm.amount) : undefined,
    });
  }, [payloadKind, hkqrForm, setPayloadHKQR]);

  useEffect(() => {
    if (payloadKind !== 'jpqr') return;
    setPayloadJPQR({
      storeId: jpqrForm.storeId,
      merchantName: jpqrForm.merchantName,
      amount: jpqrForm.amount ? Number.parseFloat(jpqrForm.amount) : undefined,
    });
  }, [payloadKind, jpqrForm, setPayloadJPQR]);

  useEffect(() => {
    if (payloadKind !== 'auspaynet') return;
    setPayloadAusPayNet({
      payId: auspaynetForm.payId || undefined,
      payIdType: auspaynetForm.payIdType,
      merchantName: auspaynetForm.merchantName,
      amount: auspaynetForm.amount ? Number.parseFloat(auspaynetForm.amount) : undefined,
    });
  }, [payloadKind, auspaynetForm, setPayloadAusPayNet]);

  useEffect(() => {
    if (payloadKind !== 'paypal_me') return;
    setPayloadPayPalMe({
      username: paypalMeForm.username,
      amount: paypalMeForm.amount ? Number.parseFloat(paypalMeForm.amount) : undefined,
    });
  }, [payloadKind, paypalMeForm, setPayloadPayPalMe]);

  useEffect(() => {
    if (payloadKind !== 'cashapp') return;
    setPayloadCashApp({
      cashtag: cashappForm.cashtag,
      amount: cashappForm.amount ? Number.parseFloat(cashappForm.amount) : undefined,
    });
  }, [payloadKind, cashappForm, setPayloadCashApp]);

  useEffect(() => {
    if (payloadKind !== 'emv_generic') return;
    setPayloadEMVGeneric({
      merchantName: emvGenericForm.merchantName,
      merchantCity: emvGenericForm.merchantCity,
      countryCode: emvGenericForm.countryCode,
      currencyCode: emvGenericForm.currencyCode,
      amount: emvGenericForm.amount ? Number.parseFloat(emvGenericForm.amount) : undefined,
      mcc: emvGenericForm.mcc || undefined,
      postalCode: emvGenericForm.postalCode || undefined,
      tipIndicator: emvGenericForm.tipIndicator as NonNullable<typeof emvGenericForm.tipIndicator>,
      tipAmount: emvGenericForm.tipAmount ? Number.parseFloat(emvGenericForm.tipAmount) : undefined,
      tipPercent: emvGenericForm.tipPercent
        ? Number.parseFloat(emvGenericForm.tipPercent)
        : undefined,
      reference: emvGenericForm.reference || undefined,
      storeLabel: emvGenericForm.storeLabel || undefined,
      terminalLabel: emvGenericForm.terminalLabel || undefined,
    });
  }, [payloadKind, emvGenericForm, setPayloadEMVGeneric]);
}

interface EditorProps {
  payload: QRState['payload'];
  tier: string;
  t: ReturnType<typeof useTranslation>['t'];
  showStartupHighlight: boolean;
  setShowStartupHighlight: (v: boolean) => void;
  setPayloadText: QRState['setPayloadText'];
  setPayloadUrl: QRState['setPayloadUrl'];
  setPayloadTel: QRState['setPayloadTel'];
  setPayloadEmail: QRState['setPayloadEmail'];
  setPayloadSms: QRState['setPayloadSms'];
  setPayloadGeo: QRState['setPayloadGeo'];
  setPayloadWifi: QRState['setPayloadWifi'];
  setPayloadVCard: QRState['setPayloadVCard'];
  setPayloadMeCard: QRState['setPayloadMeCard'];
  setPayloadEvent: QRState['setPayloadEvent'];
  setPayloadCrypto: QRState['setPayloadCrypto'];
  setPayloadOtpAuth: QRState['setPayloadOtpAuth'];
  setPayloadBizCard: QRState['setPayloadBizCard'];
  setPayloadMessaging: QRState['setPayloadMessaging'];
  setPayloadSocialProfile: QRState['setPayloadSocialProfile'];
  setPayloadAppLink: QRState['setPayloadAppLink'];
  setPayloadGS1: QRState['setPayloadGS1'];
  setPayloadCalendarSub: QRState['setPayloadCalendarSub'];
  setPayloadEventRsvp: QRState['setPayloadEventRsvp'];
  setPayloadValidation: QRState['setPayloadValidation'];
  getPayloadText: QRState['getPayloadText'];
  qr: QRState['qr'];
  epcSepaForm: EPCSepaForm;
  setEpcSepaForm: React.Dispatch<React.SetStateAction<EPCSepaForm>>;
  upiForm: UPIForm;
  setUpiForm: React.Dispatch<React.SetStateAction<UPIForm>>;
  payNowForm: PayNowForm;
  setPayNowForm: React.Dispatch<React.SetStateAction<PayNowForm>>;
  promptPayForm: PromptPayForm;
  setPromptPayForm: React.Dispatch<React.SetStateAction<PromptPayForm>>;
  pixForm: PIXForm;
  setPixForm: React.Dispatch<React.SetStateAction<PIXForm>>;
  swissQrBillForm: SwissQRBillForm;
  setSwissQrBillForm: React.Dispatch<React.SetStateAction<SwissQRBillForm>>;
  lightningForm: LightningForm;
  setLightningForm: React.Dispatch<React.SetStateAction<LightningForm>>;
  ethereumForm: EthereumForm;
  setEthereumForm: React.Dispatch<React.SetStateAction<EthereumForm>>;
  qrisForm: QRISForm;
  setQrisForm: React.Dispatch<React.SetStateAction<QRISForm>>;
  duitnowForm: DuitNowForm;
  setDuitnowForm: React.Dispatch<React.SetStateAction<DuitNowForm>>;
  bharatqrForm: BharatQRForm;
  setBharatqrForm: React.Dispatch<React.SetStateAction<BharatQRForm>>;
  vietqrForm: VietQRForm;
  setVietqrForm: React.Dispatch<React.SetStateAction<VietQRForm>>;
  qrphForm: QRPhForm;
  setQrphForm: React.Dispatch<React.SetStateAction<QRPhForm>>;
  twqrForm: TWQRForm;
  setTwqrForm: React.Dispatch<React.SetStateAction<TWQRForm>>;
  hkqrForm: HKQRForm;
  setHkqrForm: React.Dispatch<React.SetStateAction<HKQRForm>>;
  jpqrForm: JPQRForm;
  setJpqrForm: React.Dispatch<React.SetStateAction<JPQRForm>>;
  auspaynetForm: AusPayNetForm;
  setAuspaynetForm: React.Dispatch<React.SetStateAction<AusPayNetForm>>;
  paypalMeForm: PayPalMeForm;
  setPaypalMeForm: React.Dispatch<React.SetStateAction<PayPalMeForm>>;
  cashappForm: CashAppForm;
  setCashappForm: React.Dispatch<React.SetStateAction<CashAppForm>>;
  emvGenericForm: EMVGenericForm;
  setEmvGenericForm: React.Dispatch<React.SetStateAction<EMVGenericForm>>;
  shortLinkForm: ShortLinkForm;
  setShortLinkForm: React.Dispatch<React.SetStateAction<ShortLinkForm>>;
}

function PlainTextEditor({
  payload,
  setPayloadText,
  setShowStartupHighlight,
  showStartupHighlight,
  t,
}: Readonly<
  Pick<
    EditorProps,
    'payload' | 'setPayloadText' | 'setShowStartupHighlight' | 'showStartupHighlight' | 't'
  >
>) {
  return (
    <div className={`space-y-2 ${showStartupHighlight ? 'p-1 -m-1' : ''}`}>
      <Label>
        <HighlightedLabel>{t('payload.text')}</HighlightedLabel>
      </Label>
      <Textarea
        value={payload.text}
        onChange={(e) => {
          setPayloadText(e.target.value);
          setShowStartupHighlight(false);
        }}
        onFocus={() => setShowStartupHighlight(false)}
        placeholder={t('placeholders.enterText')}
        rows={4}
        className={
          showStartupHighlight
            ? 'ring-4 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse'
            : ''
        }
        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focuses textarea on first visit to guide user
        autoFocus={showStartupHighlight}
        title={t('hints.enterTextContent')}
        data-testid={DynamicTestId.resolve('payload-text-textarea', 'payload-text-textarea')}
      />
    </div>
  );
}

function UrlEditor({
  payload,
  setPayloadUrl,
  t,
  tier,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadUrl' | 't' | 'tier'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.url')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.url.href}
          onChange={(e) => setPayloadUrl({ href: e.target.value })}
          placeholder="https://anqr.link"
          title={t('hints.enterUrlContent')}
          data-testid={DynamicTestId.resolve('payload-url-input', 'payload-url-input')}
          className={
            payload.validate && payload.url.href && !isValidUrl(payload.url.href)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.url.href && !isValidUrl(payload.url.href) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>
      {(tier === 'advanced' || tier === 'professional') && (
        <div className="flex items-center justify-between">
          <Label>
            <HighlightedLabel>{t('payload.forceHttps')}</HighlightedLabel>
          </Label>
          <Switch
            checked={payload.url.forceHttps}
            onCheckedChange={(checked) => setPayloadUrl({ forceHttps: checked })}
            title={t('hints.forceHttps')}
            data-testid={DynamicTestId.resolve(
              'payload-url-force-https-switch',
              'payload-url-force-https-switch'
            )}
          />
        </div>
      )}
      {tier === 'professional' && (
        <p className="text-xs text-muted-foreground">
          {t('hints.utmNote', 'For marketing tracking (UTM parameters), use UTM Campaign Link.')}
        </p>
      )}
    </div>
  );
}

function TelEditor({
  payload,
  setPayloadTel,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadTel' | 't'>>) {
  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.phone')}</HighlightedLabel>
      </Label>
      <Input
        type="tel"
        value={payload.tel.number}
        onChange={(e) => setPayloadTel({ number: e.target.value })}
        placeholder="+1234567890"
        data-testid={DynamicTestId.resolve('payload-tel-input', 'payload-tel-input')}
        className={
          payload.validate && payload.tel.number && !isValidPhone(payload.tel.number)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && payload.tel.number && !isValidPhone(payload.tel.number) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
        </p>
      )}
    </div>
  );
}

function GeoEditor({
  payload,
  setPayloadGeo,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadGeo' | 't'>>) {
  return (
    <div className="space-y-4">
      {/* Address Lookup (Nominatim) */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.addressLookup', 'Address Lookup')}</HighlightedLabel>
        </Label>
        <div className="flex gap-2">
          <Input
            value={payload.geo.query || ''}
            onChange={(e) => setPayloadGeo({ query: e.target.value })}
            placeholder={t('placeholders.placeNameOrAddress', 'Enter address or place name')}
            data-testid={DynamicTestId.resolve(
              'payload-geo-query-input',
              'payload-geo-query-input'
            )}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && payload.geo.query) {
                e.preventDefault();
                fetch(
                  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(payload.geo.query)}&format=json&limit=1`
                )
                  .then((res) => res.json())
                  .then((data) => {
                    if (data?.[0]) {
                      setPayloadGeo({
                        lat: Number.parseFloat(data[0].lat),
                        lon: Number.parseFloat(data[0].lon),
                      });
                    }
                  })
                  .catch(() => {});
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={!payload.geo.query}
            onClick={() => {
              if (payload.geo.query) {
                fetch(
                  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(payload.geo.query)}&format=json&limit=1`
                )
                  .then((res) => res.json())
                  .then((data) => {
                    if (data?.[0]) {
                      setPayloadGeo({
                        lat: Number.parseFloat(data[0].lat),
                        lon: Number.parseFloat(data[0].lon),
                      });
                    }
                  })
                  .catch(() => {});
              }
            }}
          >
            {t('actions.lookup', 'Lookup')}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('hints.geoLookup', 'Enter an address and click Lookup to find coordinates.')}
        </p>
      </div>

      {/* Plus Code (Open Location Code) - always show in geo mode */}
      <PlusCodeDisplay lat={payload.geo.lat} lon={payload.geo.lon} t={t} />

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.latitude')}</HighlightedLabel>
          </Label>
          <Input
            type="number"
            step="any"
            value={payload.geo.lat}
            onChange={(e) => setPayloadGeo({ lat: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0.0"
            data-testid={DynamicTestId.resolve('payload-geo-lat-input', 'payload-geo-lat-input')}
            className={
              payload.validate && !isValidLatitude(payload.geo.lat)
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
          {payload.validate && !isValidLatitude(payload.geo.lat) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidLatitude', 'Latitude must be between -90 and 90')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.longitude')}</HighlightedLabel>
          </Label>
          <Input
            type="number"
            step="any"
            value={payload.geo.lon}
            onChange={(e) => setPayloadGeo({ lon: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0.0"
            data-testid={DynamicTestId.resolve('payload-geo-lon-input', 'payload-geo-lon-input')}
            className={
              payload.validate && !isValidLongitude(payload.geo.lon)
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
          {payload.validate && !isValidLongitude(payload.geo.lon) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidLongitude', 'Longitude must be between -180 and 180')}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('hints.geoNote', 'The QR code will contain: geo:{lat},{lon}')}
      </p>
    </div>
  );
}

function BluetoothEditor({
  payload,
  setPayloadText,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadText' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.deviceAddress')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder="00:11:22:33:44:55"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.deviceName')}</HighlightedLabel>
        </Label>
        <Input placeholder="My Bluetooth Device" />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.bluetoothNote')}</p>
    </div>
  );
}

function EventEditor({
  payload,
  setPayloadEvent,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadEvent' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.summary')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.event.summary || ''}
          onChange={(e) => setPayloadEvent({ summary: e.target.value })}
          placeholder="Meeting"
          data-testid={DynamicTestId.resolve(
            'payload-event-summary-input',
            'payload-event-summary-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.event.location || ''}
          onChange={(e) => setPayloadEvent({ location: e.target.value })}
          placeholder="Conference Room A"
          data-testid={DynamicTestId.resolve(
            'payload-event-location-input',
            'payload-event-location-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.event.description || ''}
          onChange={(e) => setPayloadEvent({ description: e.target.value })}
          placeholder={t('placeholders.eventDetails')}
          rows={2}
          data-testid={DynamicTestId.resolve(
            'payload-event-description-textarea',
            'payload-event-description-textarea'
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.start')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.event.start || ''}
            onChange={(value: string) => setPayloadEvent({ start: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-event-start-input',
              'payload-event-start-input'
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.end')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.event.end || ''}
            onChange={(value: string) => setPayloadEvent({ end: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-event-end-input',
              'payload-event-end-input'
            )}
          />
        </div>
      </div>
    </div>
  );
}

function EventRsvpEditor({
  payload,
  setPayloadEventRsvp,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadEventRsvp' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.summary')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.eventRsvp.summary || ''}
          onChange={(e) => setPayloadEventRsvp({ summary: e.target.value })}
          placeholder="Annual Conference 2024"
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-summary-input',
            'payload-rsvp-summary-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.eventRsvp.location || ''}
          onChange={(e) => setPayloadEventRsvp({ location: e.target.value })}
          placeholder="Conference Center"
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-location-input',
            'payload-rsvp-location-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.eventRsvp.description || ''}
          onChange={(e) => setPayloadEventRsvp({ description: e.target.value })}
          placeholder={t('placeholders.eventDetails')}
          rows={2}
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-description-textarea',
            'payload-rsvp-description-textarea'
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.start')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.eventRsvp.start || ''}
            onChange={(value: string) => setPayloadEventRsvp({ start: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-rsvp-start-input',
              'payload-rsvp-start-input'
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.end')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.eventRsvp.end || ''}
            onChange={(value: string) => setPayloadEventRsvp({ end: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve('payload-rsvp-end-input', 'payload-rsvp-end-input')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.rsvpUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.eventRsvp.rsvpUrl || ''}
          onChange={(e) => setPayloadEventRsvp({ rsvpUrl: e.target.value })}
          placeholder="https://anqr.link/rsvp/event123"
          data-testid={DynamicTestId.resolve('payload-rsvp-url-input', 'payload-rsvp-url-input')}
          className={
            payload.validate && payload.eventRsvp.rsvpUrl && !isValidUrl(payload.eventRsvp.rsvpUrl)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.eventRsvp.rsvpUrl &&
          !isValidUrl(payload.eventRsvp.rsvpUrl) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidUrl',
                'Enter a valid URL (must start with http:// or https://)'
              )}
            </p>
          )}
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.rsvpNote')}</p>
    </div>
  );
}

function CalendarSubscriptionEditor({
  payload,
  setPayloadCalendarSub,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadCalendarSub' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.calendarUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.calendarSub.url || ''}
          onChange={(e) => setPayloadCalendarSub({ url: e.target.value })}
          placeholder="webcal://anqr.link/calendar.ics"
          data-testid={DynamicTestId.resolve(
            'payload-calsub-url-input',
            'payload-calsub-url-input'
          )}
          className={
            payload.validate &&
            payload.calendarSub.url &&
            !isValidUrlWithScheme(payload.calendarSub.url)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.calendarSub.url &&
          !isValidUrlWithScheme(payload.calendarSub.url) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidCalendarUrl',
                'Enter a valid calendar URL (webcal:// or https://)'
              )}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.calendarName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.calendarSub.calendarName || ''}
          onChange={(e) => setPayloadCalendarSub({ calendarName: e.target.value })}
          placeholder="Team Schedule"
          data-testid={DynamicTestId.resolve(
            'payload-calsub-name-input',
            'payload-calsub-name-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.calendarNote')}</p>
    </div>
  );
}

function SocialProfileEditor({
  payload,
  setPayloadSocialProfile,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadSocialProfile' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.platform')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.socialProfile.platform}
          onValueChange={(v) =>
            setPayloadSocialProfile({ platform: v as typeof payload.socialProfile.platform })
          }
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-social-platform-select',
              'payload-social-platform-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">{t('payload.linkedin')}</SelectItem>
            <SelectItem value="twitter">X (Twitter)</SelectItem>
            <SelectItem value="instagram">{t('payload.instagram')}</SelectItem>
            <SelectItem value="facebook">{t('payload.facebook')}</SelectItem>
            <SelectItem value="tiktok">{t('payload.tiktok')}</SelectItem>
            <SelectItem value="youtube">{t('payload.youtube')}</SelectItem>
            <SelectItem value="github">{t('payload.github')}</SelectItem>
            <SelectItem value="other">{t('payload.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.username')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.socialProfile.username || ''}
          onChange={(e) => setPayloadSocialProfile({ username: e.target.value })}
          placeholder={
            {
              linkedin: 'johndoe',
              twitter: 'johndoe',
              instagram: 'johndoe',
              facebook: 'johndoe',
              tiktok: 'johndoe',
              youtube: 'johndoe',
              github: 'johndoe',
              other: 'username',
            }[payload.socialProfile.platform] || 'username'
          }
          data-testid={DynamicTestId.resolve(
            'payload-social-username-input',
            'payload-social-username-input'
          )}
        />
        <p className="text-xs text-muted-foreground">
          {t('hints.socialProfileGenerated', 'URL will be generated: ')}
          {payload.socialProfile.username
            ? generateSocialProfile(payload.socialProfile.platform, payload.socialProfile.username)
            : `https://${payload.socialProfile.platform}.com/...`}
        </p>
      </div>
    </div>
  );
}

function MessagingLinkEditor({
  payload,
  setPayloadMessaging,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadMessaging' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.platform')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.messaging.platform}
          onValueChange={(v) =>
            setPayloadMessaging({ platform: v as typeof payload.messaging.platform })
          }
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-messaging-platform-select',
              'payload-messaging-platform-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="whatsapp">{t('payload.whatsapp')}</SelectItem>
            <SelectItem value="telegram">{t('payload.telegram')}</SelectItem>
            <SelectItem value="signal">{t('payload.signal')}</SelectItem>
            <SelectItem value="messenger">{t('payload.messenger')}</SelectItem>
            <SelectItem value="line">LINE</SelectItem>
            <SelectItem value="viber">{t('payload.viber')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.phoneUsername')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.messaging.identifier || ''}
          onChange={(e) => setPayloadMessaging({ identifier: e.target.value })}
          placeholder={
            {
              whatsapp: '+1234567890',
              telegram: '@username',
              signal: '+1234567890',
              viber: '+1234567890',
              line: '@username',
              messenger: 'username',
            }[payload.messaging.platform] || '+1234567890'
          }
          data-testid={DynamicTestId.resolve(
            'payload-messaging-identifier-input',
            'payload-messaging-identifier-input'
          )}
          className={
            payload.validate &&
            payload.messaging.identifier &&
            !isValidPhone(payload.messaging.identifier) &&
            !payload.messaging.identifier.startsWith('@')
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.messaging.identifier &&
          !isValidPhone(payload.messaging.identifier) &&
          !payload.messaging.identifier.startsWith('@') && (
            <p className="text-xs text-destructive">
              {t('validation.invalidPhoneOrUsername', 'Enter a valid phone number or @username')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.prefilledMessage')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.messaging.message || ''}
          onChange={(e) => setPayloadMessaging({ message: e.target.value })}
          placeholder="Hello! I scanned your QR code..."
          rows={2}
          data-testid={DynamicTestId.resolve(
            'payload-messaging-message-textarea',
            'payload-messaging-message-textarea'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t('hints.messagingLinkGenerated', 'Link: ')}
        {payload.messaging.identifier
          ? generateMessagingLink(
              payload.messaging.platform,
              payload.messaging.identifier,
              payload.messaging.message
            )
          : '...'}
      </p>
    </div>
  );
}

function CryptoEditor({
  payload,
  setPayloadCrypto,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadCrypto' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.cryptocurrency')}</HighlightedLabel>
        </Label>
        <Select value={payload.crypto.type} onValueChange={(v) => setPayloadCrypto({ type: v })}>
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-crypto-type-select',
              'payload-crypto-type-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bitcoin">{t('payload.bitcoin')}</SelectItem>
            <SelectItem value="ethereum">{t('payload.ethereum')}</SelectItem>
            <SelectItem value="litecoin">{t('payload.litecoin')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.walletAddress')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.crypto.address}
          onChange={(e) => setPayloadCrypto({ address: e.target.value })}
          placeholder="Wallet address"
          data-testid={DynamicTestId.resolve(
            'payload-crypto-address-input',
            'payload-crypto-address-input'
          )}
          className={
            payload.validate &&
            payload.crypto.address &&
            !isValidCryptoAddress(payload.crypto.address, payload.crypto.type)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.crypto.address &&
          !isValidCryptoAddress(payload.crypto.address, payload.crypto.type) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidWalletAddress', 'Enter a valid wallet address')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amount')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="any"
          value={payload.crypto.amount || ''}
          onChange={(e) =>
            setPayloadCrypto({ amount: Number.parseFloat(e.target.value) || undefined })
          }
          placeholder="0.001"
          data-testid={DynamicTestId.resolve(
            'payload-crypto-amount-input',
            'payload-crypto-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.label')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.crypto.label || ''}
          onChange={(e) => setPayloadCrypto({ label: e.target.value })}
          placeholder={t('placeholders.paymentFor')}
          data-testid={DynamicTestId.resolve(
            'payload-crypto-label-input',
            'payload-crypto-label-input'
          )}
        />
      </div>
    </div>
  );
}

function EpcSepaEditor({
  epcSepaForm,
  payload,
  setEpcSepaForm,
  t,
}: Readonly<Pick<EditorProps, 'epcSepaForm' | 'payload' | 'setEpcSepaForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.beneficiaryName')}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.name}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Company Ltd."
          data-testid={DynamicTestId.resolve('payload-epc-name-input', 'payload-epc-name-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.iban')}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.iban}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, iban: e.target.value }))}
          placeholder="DE89370400440532013000"
          data-testid={DynamicTestId.resolve('payload-epc-iban-input', 'payload-epc-iban-input')}
          className={
            payload.validate && epcSepaForm.iban && !isValidIBAN(epcSepaForm.iban)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && epcSepaForm.iban && !isValidIBAN(epcSepaForm.iban) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidIBAN', 'Enter a valid IBAN')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.bicSwift')}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.bic}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, bic: e.target.value }))}
          placeholder="COBADEFFXXX"
          data-testid={DynamicTestId.resolve('payload-epc-bic-input', 'payload-epc-bic-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountEur')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={epcSepaForm.amount}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="100.00"
          data-testid={DynamicTestId.resolve(
            'payload-epc-amount-input',
            'payload-epc-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.reference')}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.reference}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, reference: e.target.value }))}
          placeholder="Invoice 12345"
          data-testid={DynamicTestId.resolve(
            'payload-epc-reference-input',
            'payload-epc-reference-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.epcSepaNote')}</p>
    </div>
  );
}

function UpiEditor({
  payload,
  setUpiForm,
  t,
  upiForm,
}: Readonly<Pick<EditorProps, 'payload' | 'setUpiForm' | 't' | 'upiForm'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.upiId')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.vpa}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, vpa: e.target.value }))}
          placeholder="name@upi"
          data-testid={DynamicTestId.resolve('payload-upi-vpa-input', 'payload-upi-vpa-input')}
          className={
            payload.validate && upiForm.vpa && !isValidUpiVpa(upiForm.vpa)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && upiForm.vpa && !isValidUpiVpa(upiForm.vpa) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUpiVpa', 'Enter a valid UPI ID (e.g., name@upi)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.payeeName')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.payeeName}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, payeeName: e.target.value }))}
          placeholder="John Doe"
          data-testid={DynamicTestId.resolve(
            'payload-upi-payee-name-input',
            'payload-upi-payee-name-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountInr')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={upiForm.amount}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="500.00"
          data-testid={DynamicTestId.resolve(
            'payload-upi-amount-input',
            'payload-upi-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.transactionNote')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.transactionNote}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, transactionNote: e.target.value }))}
          placeholder="Payment for order"
          data-testid={DynamicTestId.resolve('payload-upi-note-input', 'payload-upi-note-input')}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.upiNote')}</p>
    </div>
  );
}

function PaynowEditor({
  payNowForm,
  payload,
  setPayNowForm,
  t,
}: Readonly<Pick<EditorProps, 'payNowForm' | 'payload' | 'setPayNowForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.proxyType')}</HighlightedLabel>
        </Label>
        <Select
          value={payNowForm.type}
          onValueChange={(v) => setPayNowForm((prev) => ({ ...prev, type: v as 'mobile' | 'uen' }))}
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-paynow-type-select',
              'payload-paynow-type-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uen">UEN (Business)</SelectItem>
            <SelectItem value="mobile">{t('payload.mobileNumber')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.uenMobile')}</HighlightedLabel>
        </Label>
        <Input
          value={payNowForm.value}
          onChange={(e) => setPayNowForm((prev) => ({ ...prev, value: e.target.value }))}
          placeholder="201234567X or +65..."
          data-testid={DynamicTestId.resolve(
            'payload-paynow-value-input',
            'payload-paynow-value-input'
          )}
          className={
            payload.validate &&
            payNowForm.value &&
            payNowForm.type === 'mobile' &&
            !isValidPhone(payNowForm.value)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payNowForm.value &&
          payNowForm.type === 'mobile' &&
          !isValidPhone(payNowForm.value) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountSgd')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={payNowForm.amount}
          onChange={(e) => setPayNowForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="50.00"
          data-testid={DynamicTestId.resolve(
            'payload-paynow-amount-input',
            'payload-paynow-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.referenceOptional')}</HighlightedLabel>
        </Label>
        <Input
          value={payNowForm.reference}
          onChange={(e) => setPayNowForm((prev) => ({ ...prev, reference: e.target.value }))}
          placeholder="Invoice 123"
          data-testid={DynamicTestId.resolve(
            'payload-paynow-reference-input',
            'payload-paynow-reference-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.paynowNote')}</p>
    </div>
  );
}

function PromptpayEditor({
  payload,
  promptPayForm,
  setPromptPayForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'promptPayForm' | 'setPromptPayForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.idType')}</HighlightedLabel>
        </Label>
        <Select
          value={promptPayForm.type}
          onValueChange={(v) =>
            setPromptPayForm((prev) => ({ ...prev, type: v as 'mobile' | 'id' | 'ewallet' }))
          }
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-promptpay-type-select',
              'payload-promptpay-type-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile">{t('payload.mobileNumber')}</SelectItem>
            <SelectItem value="id">{t('payload.nationalIdTaxId')}</SelectItem>
            <SelectItem value="ewallet">E-Wallet ID</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.promptPayId')}</HighlightedLabel>
        </Label>
        <Input
          value={promptPayForm.value}
          onChange={(e) => setPromptPayForm((prev) => ({ ...prev, value: e.target.value }))}
          placeholder="0812345678"
          data-testid={DynamicTestId.resolve(
            'payload-promptpay-value-input',
            'payload-promptpay-value-input'
          )}
          className={
            payload.validate &&
            promptPayForm.value &&
            promptPayForm.type === 'mobile' &&
            !isValidPhone(promptPayForm.value)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          promptPayForm.value &&
          promptPayForm.type === 'mobile' &&
          !isValidPhone(promptPayForm.value) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountThb')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={promptPayForm.amount}
          onChange={(e) => setPromptPayForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="100.00"
          data-testid={DynamicTestId.resolve(
            'payload-promptpay-amount-input',
            'payload-promptpay-amount-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.promptpayNote')}</p>
    </div>
  );
}

function PixEditor({
  payload,
  pixForm,
  setPixForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'pixForm' | 'setPixForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.pixKey')}</HighlightedLabel>
        </Label>
        <Input
          value={pixForm.key}
          onChange={(e) => setPixForm((prev) => ({ ...prev, key: e.target.value }))}
          placeholder="CPF, CNPJ, Email, Phone, or Random Key"
          data-testid={DynamicTestId.resolve('payload-pix-key-input', 'payload-pix-key-input')}
          className={
            payload.validate && pixForm.key && pixForm.key.length < 3
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && pixForm.key && pixForm.key.length < 3 && (
          <p className="text-xs text-destructive">
            {t('validation.invalidPixKey', 'Enter a valid PIX key (at least 3 characters)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.merchantName')}</HighlightedLabel>
        </Label>
        <Input
          value={pixForm.name}
          onChange={(e) => setPixForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="João Silva"
          data-testid={DynamicTestId.resolve('payload-pix-name-input', 'payload-pix-name-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.cityOptional')}</HighlightedLabel>
        </Label>
        <Input
          value={pixForm.city}
          onChange={(e) => setPixForm((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="São Paulo"
          data-testid={DynamicTestId.resolve('payload-pix-city-input', 'payload-pix-city-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountBrl')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={pixForm.amount}
          onChange={(e) => setPixForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="100.00"
          data-testid={DynamicTestId.resolve(
            'payload-pix-amount-input',
            'payload-pix-amount-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.pixNote')}</p>
    </div>
  );
}

function SwissQrBillEditor({
  payload,
  setSwissQrBillForm,
  swissQrBillForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setSwissQrBillForm' | 'swissQrBillForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('payload.iban')}</Label>
        <Input
          placeholder="CH93 0076 2011 6238 5295 7"
          value={swissQrBillForm.creditorIBAN}
          onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, creditorIBAN: e.target.value })}
          className={
            payload.validate &&
            swissQrBillForm.creditorIBAN &&
            !isValidIBAN(swissQrBillForm.creditorIBAN)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          swissQrBillForm.creditorIBAN &&
          !isValidIBAN(swissQrBillForm.creditorIBAN) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidIBAN', 'Enter a valid IBAN')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.beneficiaryName')}</Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={swissQrBillForm.creditorName}
          onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, creditorName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.city')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.zurich')}
            value={swissQrBillForm.creditorCity}
            onChange={(e) =>
              setSwissQrBillForm({ ...swissQrBillForm, creditorCity: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('payload.country')}</Label>
          <Select
            value={swissQrBillForm.creditorCountry}
            onValueChange={(v) => setSwissQrBillForm({ ...swissQrBillForm, creditorCountry: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CH">{t('placeholders.switzerland')}</SelectItem>
              <SelectItem value="LI">{t('placeholders.liechtenstein')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.amount')} {t('common.optional')}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={swissQrBillForm.amount}
            onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('placeholders.currency')}</Label>
          <Select
            value={swissQrBillForm.currency}
            onValueChange={(v: 'CHF' | 'EUR') =>
              setSwissQrBillForm({ ...swissQrBillForm, currency: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHF">CHF</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>{t('placeholders.referenceType')}</Label>
          <Select
            value={swissQrBillForm.referenceType}
            onValueChange={(v: 'QRR' | 'SCOR' | 'NON') =>
              setSwissQrBillForm({ ...swissQrBillForm, referenceType: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QRR">{t('placeholders.qrReference')}</SelectItem>
              <SelectItem value="SCOR">{t('placeholders.creditorRefIso')}</SelectItem>
              <SelectItem value="NON">{t('common.none')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            {t('payload.reference')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.invoiceReference')}
            value={swissQrBillForm.reference}
            onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, reference: e.target.value })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.swissQrBillHint')}</p>
    </div>
  );
}

function LightningEditor({
  lightningForm,
  payload,
  setLightningForm,
  t,
}: Readonly<Pick<EditorProps, 'lightningForm' | 'payload' | 'setLightningForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.bolt11Invoice')}</Label>
        <Textarea
          placeholder={t('placeholders.lnbcPlaceholder')}
          className={`font-mono text-xs h-24 ${
            payload.validate &&
            lightningForm.invoice &&
            !isValidLightningInvoice(lightningForm.invoice)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }`}
          value={lightningForm.invoice}
          onChange={(e) => setLightningForm({ invoice: e.target.value })}
        />
        {payload.validate &&
          lightningForm.invoice &&
          !isValidLightningInvoice(lightningForm.invoice) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidLightningInvoice',
                'Enter a valid Lightning invoice (starts with lnbc)'
              )}
            </p>
          )}
        <p className="text-xs text-muted-foreground">{t('placeholders.bolt11Hint')}</p>
      </div>
    </div>
  );
}

function EthereumEip681Editor({
  ethereumForm,
  payload,
  setEthereumForm,
  t,
}: Readonly<Pick<EditorProps, 'ethereumForm' | 'payload' | 'setEthereumForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('payload.walletAddress')}</Label>
        <Input
          placeholder={t('placeholders.ethAddressPlaceholder')}
          className={`font-mono ${
            payload.validate &&
            ethereumForm.targetAddress &&
            !isValidEthereumAddress(ethereumForm.targetAddress)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }`}
          value={ethereumForm.targetAddress}
          onChange={(e) => setEthereumForm({ ...ethereumForm, targetAddress: e.target.value })}
        />
        {payload.validate &&
          ethereumForm.targetAddress &&
          !isValidEthereumAddress(ethereumForm.targetAddress) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidEthereumAddress', 'Enter a valid Ethereum address (0x...)')}
            </p>
          )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>{t('placeholders.chainId')}</Label>
          <Select
            value={ethereumForm.chainId}
            onValueChange={(v) => setEthereumForm({ ...ethereumForm, chainId: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('placeholders.ethMainnet')}</SelectItem>
              <SelectItem value="137">{t('placeholders.polygon')}</SelectItem>
              <SelectItem value="56">{t('placeholders.bsc')}</SelectItem>
              <SelectItem value="43114">{t('placeholders.avalanche')}</SelectItem>
              <SelectItem value="42161">{t('placeholders.arbitrum')}</SelectItem>
              <SelectItem value="10">{t('placeholders.optimism')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            {t('placeholders.valueWei')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.weiPlaceholder')}
            value={ethereumForm.value}
            onChange={(e) => setEthereumForm({ ...ethereumForm, value: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          {t('placeholders.gasLimitOptional')} {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder={t('placeholders.gasPlaceholder')}
          value={ethereumForm.gas}
          onChange={(e) => setEthereumForm({ ...ethereumForm, gas: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.eip681Hint')}</p>
    </div>
  );
}

function QrisEditor({
  payload,
  qrisForm,
  setQrisForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'qrisForm' | 'setQrisForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.merchantId')}</Label>
        <Input
          placeholder={t('placeholders.qrisMerchantIdPlaceholder')}
          value={qrisForm.merchantId}
          onChange={(e) => setQrisForm({ ...qrisForm, merchantId: e.target.value })}
          className={
            payload.validate && qrisForm.merchantId && !isValidMerchantId(qrisForm.merchantId)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && qrisForm.merchantId && !isValidMerchantId(qrisForm.merchantId) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidMerchantId', 'Enter a valid merchant ID')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.tokoPlaceholder')}
          value={qrisForm.merchantName}
          onChange={(e) => setQrisForm({ ...qrisForm, merchantName: e.target.value })}
          className={
            payload.validate && !isNonEmpty(qrisForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && !isNonEmpty(qrisForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.requiredField', 'This field is required')}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.city')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.jakartaPlaceholder')}
            value={qrisForm.merchantCity}
            onChange={(e) => setQrisForm({ ...qrisForm, merchantCity: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            {t('payload.amount')} (IDR) {t('common.optional')}
          </Label>
          <Input
            type="number"
            placeholder={t('placeholders.idrAmountPlaceholder')}
            value={qrisForm.amount}
            onChange={(e) => setQrisForm({ ...qrisForm, amount: e.target.value })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.qrisHint')}</p>
    </div>
  );
}

function DuitnowEditor({
  duitnowForm,
  payload,
  setDuitnowForm,
  t,
}: Readonly<Pick<EditorProps, 'duitnowForm' | 'payload' | 'setDuitnowForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('payload.proxyType')}</Label>
        <Select
          value={duitnowForm.proxyType}
          onValueChange={(v: DuitNowForm['proxyType']) =>
            setDuitnowForm({ ...duitnowForm, proxyType: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MOBILE">{t('placeholders.mobileNumber')}</SelectItem>
            <SelectItem value="NRIC">{t('placeholders.nric')}</SelectItem>
            <SelectItem value="PASSPORT">{t('placeholders.passport')}</SelectItem>
            <SelectItem value="ARMY">{t('placeholders.armyId')}</SelectItem>
            <SelectItem value="BUSINESS">{t('placeholders.businessRegistration')}</SelectItem>
            <SelectItem value="OTHERS">{t('placeholders.others')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('placeholders.proxyValue')}</Label>
        <Input
          placeholder={t('placeholders.myPhonePlaceholder')}
          value={duitnowForm.proxyValue}
          onChange={(e) => setDuitnowForm({ ...duitnowForm, proxyValue: e.target.value })}
          className={
            payload.validate &&
            duitnowForm.proxyValue &&
            !isValidProxyValue(duitnowForm.proxyValue, duitnowForm.proxyType)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          duitnowForm.proxyValue &&
          !isValidProxyValue(duitnowForm.proxyValue, duitnowForm.proxyType) && (
            <p className="text-xs text-destructive">
              {duitnowForm.proxyType === 'MOBILE'
                ? t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')
                : duitnowForm.proxyType === 'NRIC'
                  ? t('validation.invalidNric', 'Enter a valid NRIC (12 digits)')
                  : t('validation.invalidProxyValue', 'Enter a valid proxy value')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={duitnowForm.merchantName}
          onChange={(e) => setDuitnowForm({ ...duitnowForm, merchantName: e.target.value })}
          className={
            payload.validate && !isNonEmpty(duitnowForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && !isNonEmpty(duitnowForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.requiredField', 'This field is required')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (MYR) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={duitnowForm.amount}
          onChange={(e) => setDuitnowForm({ ...duitnowForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.duitnowHint')}</p>
    </div>
  );
}

function BharatqrEditor({
  bharatqrForm,
  payload,
  setBharatqrForm,
  t,
}: Readonly<Pick<EditorProps, 'bharatqrForm' | 'payload' | 'setBharatqrForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {t('payload.upiId')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.upiId')}
          value={bharatqrForm.merchantVPA}
          onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantVPA: e.target.value })}
          className={
            payload.validate && bharatqrForm.merchantVPA && !isValidUpiVpa(bharatqrForm.merchantVPA)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          bharatqrForm.merchantVPA &&
          !isValidUpiVpa(bharatqrForm.merchantVPA) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidUpiVpa', 'Enter a valid UPI ID (e.g., name@upi)')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={bharatqrForm.merchantName}
          onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.city')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.mumbaiPlaceholder')}
            value={bharatqrForm.merchantCity}
            onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantCity: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('payload.amountInr')}</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={bharatqrForm.amount}
            onChange={(e) => setBharatqrForm({ ...bharatqrForm, amount: e.target.value })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.bharatqrHint')}</p>
    </div>
  );
}

function VietqrEditor({
  payload,
  setVietqrForm,
  t,
  vietqrForm,
}: Readonly<Pick<EditorProps, 'payload' | 'setVietqrForm' | 't' | 'vietqrForm'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.bankBin')}</Label>
        <Input
          placeholder={t('placeholders.bankBinPlaceholder')}
          value={vietqrForm.bankBin}
          onChange={(e) => setVietqrForm({ ...vietqrForm, bankBin: e.target.value })}
          className={
            payload.validate && vietqrForm.bankBin && !isValidBankBin(vietqrForm.bankBin)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && vietqrForm.bankBin && !isValidBankBin(vietqrForm.bankBin) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidBankBin', 'Enter a valid bank BIN (6-8 digits)')}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('placeholders.napasHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>{t('placeholders.accountNumber')}</Label>
        <Input
          placeholder={t('placeholders.accountNumberPlaceholder')}
          value={vietqrForm.accountNumber}
          onChange={(e) => setVietqrForm({ ...vietqrForm, accountNumber: e.target.value })}
          className={
            payload.validate &&
            vietqrForm.accountNumber &&
            !isValidAccountNumber(vietqrForm.accountNumber)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          vietqrForm.accountNumber &&
          !isValidAccountNumber(vietqrForm.accountNumber) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidAccountNumber',
                'Enter a valid account number (at least 4 digits)'
              )}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.accountName')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.vietnameseName')}
          value={vietqrForm.accountName}
          onChange={(e) => setVietqrForm({ ...vietqrForm, accountName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (VND) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder={t('placeholders.vndAmountPlaceholder')}
          value={vietqrForm.amount}
          onChange={(e) => setVietqrForm({ ...vietqrForm, amount: e.target.value })}
        />
      </div>
    </div>
  );
}

function QrphEditor({
  payload,
  qrphForm,
  setQrphForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'qrphForm' | 'setQrphForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.accountNumber')}</Label>
        <Input
          placeholder={t('placeholders.accountNumberPlaceholder')}
          value={qrphForm.accountNumber}
          onChange={(e) => setQrphForm({ ...qrphForm, accountNumber: e.target.value })}
          className={
            payload.validate &&
            qrphForm.accountNumber &&
            !isValidAccountNumber(qrphForm.accountNumber)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          qrphForm.accountNumber &&
          !isValidAccountNumber(qrphForm.accountNumber) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidAccountNumber',
                'Enter a valid account number (at least 4 digits)'
              )}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.filipinoName')}
          value={qrphForm.merchantName}
          onChange={(e) => setQrphForm({ ...qrphForm, merchantName: e.target.value })}
          className={
            payload.validate && !isNonEmpty(qrphForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && !isNonEmpty(qrphForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.requiredField', 'This field is required')}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.city')} {t('common.optional')}
          </Label>
          <Input
            placeholder={t('placeholders.manilaPlaceholder')}
            value={qrphForm.merchantCity}
            onChange={(e) => setQrphForm({ ...qrphForm, merchantCity: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            {t('payload.amount')} (PHP) {t('common.optional')}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={qrphForm.amount}
            onChange={(e) => setQrphForm({ ...qrphForm, amount: e.target.value })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.qrphHint')}</p>
    </div>
  );
}

function TwqrEditor({
  payload,
  setTwqrForm,
  t,
  twqrForm,
}: Readonly<Pick<EditorProps, 'payload' | 'setTwqrForm' | 't' | 'twqrForm'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.merchantId')}</Label>
        <Input
          placeholder={t('placeholders.twMerchantIdPlaceholder')}
          value={twqrForm.merchantId}
          onChange={(e) => setTwqrForm({ ...twqrForm, merchantId: e.target.value })}
          className={
            payload.validate && twqrForm.merchantId && !isValidMerchantId(twqrForm.merchantId)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && twqrForm.merchantId && !isValidMerchantId(twqrForm.merchantId) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidMerchantId', 'Enter a valid merchant ID')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.twMerchantNamePlaceholder')}
          value={twqrForm.merchantName}
          onChange={(e) => setTwqrForm({ ...twqrForm, merchantName: e.target.value })}
          className={
            payload.validate && !isNonEmpty(twqrForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && !isNonEmpty(twqrForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.requiredField', 'This field is required')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (TWD) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0"
          value={twqrForm.amount}
          onChange={(e) => setTwqrForm({ ...twqrForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.twqrHint')}</p>
    </div>
  );
}

function HkqrEditor({
  hkqrForm,
  payload,
  setHkqrForm,
  t,
}: Readonly<Pick<EditorProps, 'hkqrForm' | 'payload' | 'setHkqrForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {t('placeholders.fpsId')} {t('common.optional')}
        </Label>
        <Input
          placeholder="1234567890"
          value={hkqrForm.fpsId}
          onChange={(e) => setHkqrForm({ ...hkqrForm, fpsId: e.target.value })}
          className={
            payload.validate && hkqrForm.fpsId && !isValidFpsId(hkqrForm.fpsId)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && hkqrForm.fpsId && !isValidFpsId(hkqrForm.fpsId) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidFpsId', 'Enter a valid FPS ID (7-9 digits)')}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('placeholders.fpsHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.merchantName')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={hkqrForm.merchantName}
          onChange={(e) => setHkqrForm({ ...hkqrForm, merchantName: e.target.value })}
          className={
            payload.validate && hkqrForm.merchantName && !isNonEmpty(hkqrForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && hkqrForm.merchantName && !isNonEmpty(hkqrForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidMerchantName', 'Enter a valid merchant name')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (HKD) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={hkqrForm.amount}
          onChange={(e) => setHkqrForm({ ...hkqrForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t('placeholders.hkqrHint', 'Hong Kong FPS (Faster Payment System) QR code.')}
      </p>
    </div>
  );
}

function JpqrEditor({
  jpqrForm,
  payload,
  setJpqrForm,
  t,
}: Readonly<Pick<EditorProps, 'jpqrForm' | 'payload' | 'setJpqrForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.storeId')}</Label>
        <Input
          placeholder={t('placeholders.jpStoreIdPlaceholder')}
          value={jpqrForm.storeId}
          onChange={(e) => setJpqrForm({ ...jpqrForm, storeId: e.target.value })}
          className={
            payload.validate && jpqrForm.storeId && !isValidStoreId(jpqrForm.storeId)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && jpqrForm.storeId && !isValidStoreId(jpqrForm.storeId) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidStoreId', 'Enter a valid store ID')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.jpMerchantNamePlaceholder')}
          value={jpqrForm.merchantName}
          onChange={(e) => setJpqrForm({ ...jpqrForm, merchantName: e.target.value })}
          className={
            payload.validate && !isNonEmpty(jpqrForm.merchantName)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && !isNonEmpty(jpqrForm.merchantName) && (
          <p className="text-xs text-destructive">
            {t('validation.requiredField', 'This field is required')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (JPY) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0"
          value={jpqrForm.amount}
          onChange={(e) => setJpqrForm({ ...jpqrForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.jpqrHint')}</p>
    </div>
  );
}

function AuspaynetEditor({
  auspaynetForm,
  payload,
  setAuspaynetForm,
  t,
}: Readonly<Pick<EditorProps, 'auspaynetForm' | 'payload' | 'setAuspaynetForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.payIdType')}</Label>
        <Select
          value={auspaynetForm.payIdType}
          onValueChange={(v: AusPayNetForm['payIdType']) =>
            setAuspaynetForm({ ...auspaynetForm, payIdType: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMAIL">{t('placeholders.emailOption')}</SelectItem>
            <SelectItem value="MOBILE">{t('placeholders.mobileOption')}</SelectItem>
            <SelectItem value="ABN">{t('placeholders.abn')}</SelectItem>
            <SelectItem value="ORG">{t('placeholders.organizationId')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('placeholders.payId')}</Label>
        <Input
          placeholder={(() => {
            if (auspaynetForm.payIdType === 'EMAIL') return t('placeholders.emailExample');
            if (auspaynetForm.payIdType === 'MOBILE') return '+61400123456';
            return '12345678901';
          })()}
          value={auspaynetForm.payId}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, payId: e.target.value })}
          className={
            payload.validate &&
            auspaynetForm.payId &&
            ((auspaynetForm.payIdType === 'EMAIL' && !isValidEmail(auspaynetForm.payId)) ||
              (auspaynetForm.payIdType === 'MOBILE' && !isValidPhone(auspaynetForm.payId)) ||
              (auspaynetForm.payIdType === 'ABN' && !isValidABN(auspaynetForm.payId)))
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          auspaynetForm.payId &&
          ((auspaynetForm.payIdType === 'EMAIL' && !isValidEmail(auspaynetForm.payId)) ||
            (auspaynetForm.payIdType === 'MOBILE' && !isValidPhone(auspaynetForm.payId)) ||
            (auspaynetForm.payIdType === 'ABN' && !isValidABN(auspaynetForm.payId))) && (
            <p className="text-xs text-destructive">
              {auspaynetForm.payIdType === 'EMAIL'
                ? t('validation.invalidEmail', 'Enter a valid email address (must contain @)')
                : auspaynetForm.payIdType === 'ABN'
                  ? t('validation.invalidABN', 'Enter a valid ABN (11 digits)')
                  : t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.merchantName')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={auspaynetForm.merchantName}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, merchantName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (AUD) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={auspaynetForm.amount}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.auspaynetHint')}</p>
    </div>
  );
}

function PaypalMeEditor({
  payload,
  paypalMeForm,
  setPaypalMeForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'paypalMeForm' | 'setPaypalMeForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.paypalMeUsername')}</Label>
        <Input
          placeholder={t('placeholders.yourname')}
          value={paypalMeForm.username}
          onChange={(e) => setPaypalMeForm({ ...paypalMeForm, username: e.target.value })}
          className={
            payload.validate &&
            paypalMeForm.username &&
            !isValidPayPalUsername(paypalMeForm.username)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          paypalMeForm.username &&
          !isValidPayPalUsername(paypalMeForm.username) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidPayPalUsername',
                'Enter a valid PayPal.Me username (4-20 alphanumeric characters)'
              )}
            </p>
          )}
        <p className="text-xs text-muted-foreground">{t('placeholders.paypalMeHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={paypalMeForm.amount}
          onChange={(e) => setPaypalMeForm({ ...paypalMeForm, amount: e.target.value })}
        />
      </div>
    </div>
  );
}

function CashappEditor({
  cashappForm,
  payload,
  setCashappForm,
  t,
}: Readonly<Pick<EditorProps, 'cashappForm' | 'payload' | 'setCashappForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.cashtag')}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            placeholder={t('placeholders.yourname')}
            className={`pl-7 ${
              payload.validate && cashappForm.cashtag && !isValidCashtag(cashappForm.cashtag)
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }`}
            value={cashappForm.cashtag}
            onChange={(e) =>
              setCashappForm({ ...cashappForm, cashtag: e.target.value.replace(/^\$/, '') })
            }
          />
          {payload.validate && cashappForm.cashtag && !isValidCashtag(cashappForm.cashtag) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidCashtag',
                'Enter a valid $cashtag (starts with letter, alphanumeric)'
              )}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('placeholders.cashappHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={cashappForm.amount}
          onChange={(e) => setCashappForm({ ...cashappForm, amount: e.target.value })}
        />
      </div>
    </div>
  );
}

function EmvGenericEditor({
  emvGenericForm,
  payload: _payload,
  setEmvGenericForm,
  t,
}: Readonly<Pick<EditorProps, 'emvGenericForm' | 'payload' | 'setEmvGenericForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('payload.merchantName')}</Label>
        <Input
          placeholder={t('placeholders.fullName')}
          value={emvGenericForm.merchantName}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, merchantName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.city')} {t('common.optional')}
        </Label>
        <Input
          placeholder="Singapore"
          value={emvGenericForm.merchantCity}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, merchantCity: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>{t('placeholders.countryCode')}</Label>
          <Input
            placeholder="SG"
            maxLength={2}
            value={emvGenericForm.countryCode}
            onChange={(e) =>
              setEmvGenericForm({
                ...emvGenericForm,
                countryCode: e.target.value.toUpperCase(),
              })
            }
          />
          <p className="text-xs text-muted-foreground">{t('placeholders.isoCountryHint')}</p>
        </div>
        <div className="space-y-2">
          <Label>{t('placeholders.currencyCode')}</Label>
          <Input
            placeholder="702"
            maxLength={3}
            value={emvGenericForm.currencyCode}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, currencyCode: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">{t('placeholders.isoCurrencyHint')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t('payload.amount')} {t('common.optional')}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={emvGenericForm.amount}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            {t('placeholders.mcc')} {t('common.optional')}
          </Label>
          <Input
            placeholder="5411"
            maxLength={4}
            value={emvGenericForm.mcc}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, mcc: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t('placeholders.tipConvenienceFee')}</Label>
        <Select
          value={emvGenericForm.tipIndicator}
          onValueChange={(v: EMVGenericForm['tipIndicator']) =>
            setEmvGenericForm({ ...emvGenericForm, tipIndicator: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('common.none')}</SelectItem>
            <SelectItem value="prompt">{t('placeholders.promptUser')}</SelectItem>
            <SelectItem value="fixed">{t('placeholders.fixedAmount')}</SelectItem>
            <SelectItem value="percent">{t('placeholders.percentageOption')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {emvGenericForm.tipIndicator === 'fixed' && (
        <div className="space-y-2">
          <Label>{t('placeholders.tipAmount')}</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={emvGenericForm.tipAmount}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, tipAmount: e.target.value })}
          />
        </div>
      )}
      {emvGenericForm.tipIndicator === 'percent' && (
        <div className="space-y-2">
          <Label>{t('placeholders.tipPercentage')}</Label>
          <Input
            type="number"
            placeholder="10"
            value={emvGenericForm.tipPercent}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, tipPercent: e.target.value })}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>
          {t('payload.reference')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.invoiceReference')}
          value={emvGenericForm.reference}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, reference: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('placeholders.emvGenericHint')}</p>
    </div>
  );
}

function RemovedOtpauthEditor({
  payload,
  setPayloadOtpAuth,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadOtpAuth' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.otpType')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.otpauth.type || 'totp'}
          onValueChange={(v) => setPayloadOtpAuth({ type: v as 'totp' | 'hotp' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totp">TOTP (Time-based)</SelectItem>
            <SelectItem value="hotp">HOTP (Counter-based)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.issuer')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.issuer || ''}
          onChange={(e) => setPayloadOtpAuth({ issuer: e.target.value })}
          placeholder="MyApp"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.accountName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.account || ''}
          onChange={(e) => setPayloadOtpAuth({ account: e.target.value })}
          placeholder="user@anqr.link"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.secretBase32')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.secret || ''}
          onChange={(e) => setPayloadOtpAuth({ secret: e.target.value })}
          placeholder="JBSWY3DPEHPK3PXP"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.algorithm')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.otpauth.algorithm || 'SHA1'}
          onValueChange={(v) => setPayloadOtpAuth({ algorithm: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SHA1">SHA1</SelectItem>
            <SelectItem value="SHA256">SHA256</SelectItem>
            <SelectItem value="SHA512">SHA512</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.digits')}</HighlightedLabel>
          </Label>
          <Input
            type="number"
            value={payload.otpauth.digits || 6}
            onChange={(e) =>
              setPayloadOtpAuth({ digits: Number.parseInt(e.target.value, 10) || 6 })
            }
            min={6}
            max={8}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>
              {payload.otpauth.type === 'hotp' ? t('payload.counter') : t('payload.periodSec')}
            </HighlightedLabel>
          </Label>
          <Input
            type="number"
            value={
              payload.otpauth.type === 'hotp'
                ? payload.otpauth.counter || 0
                : payload.otpauth.period || 30
            }
            onChange={(e) => {
              if (payload.otpauth.type === 'hotp') {
                setPayloadOtpAuth({ counter: Number.parseInt(e.target.value, 10) || 0 });
              } else {
                setPayloadOtpAuth({ period: Number.parseInt(e.target.value, 10) || 30 });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ShortLinkEditor({
  payload,
  setPayloadText,
  setShortLinkForm,
  shortLinkForm,
  t,
}: Readonly<
  Pick<EditorProps, 'payload' | 'setPayloadText' | 'setShortLinkForm' | 'shortLinkForm' | 't'>
>) {
  return (
    <div className="space-y-4">
      {/* Long URL to shorten */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.longUrl', 'Long URL')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={shortLinkForm.longUrl}
          onChange={(e) =>
            setShortLinkForm((prev) => ({ ...prev, longUrl: e.target.value, error: '' }))
          }
          placeholder="https://example.com/very/long/url/that/needs/shortening"
          data-testid={DynamicTestId.resolve(
            'payload-shortlink-long-input',
            'payload-shortlink-long-input'
          )}
        />
      </div>

      {/* Using TinyURL - the most reliable free URL shortener with browser support */}

      {/* Shorten button */}
      <button
        type="button"
        className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        disabled={
          !shortLinkForm.longUrl || shortLinkForm.isLoading || !isValidUrl(shortLinkForm.longUrl)
        }
        onClick={async () => {
          if (!shortLinkForm.longUrl) return;
          setShortLinkForm((prev) => ({ ...prev, isLoading: true, error: '' }));

          try {
            let shortUrl = '';
            const encodedUrl = encodeURIComponent(shortLinkForm.longUrl);

            // TinyURL - the most reliable free URL shortener with browser CORS support
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodedUrl}`);
            if (!response.ok) throw new Error('TinyURL service unavailable');
            shortUrl = await response.text();

            if (shortUrl.startsWith('http')) {
              setShortLinkForm((prev) => ({ ...prev, shortUrl, isLoading: false }));
              setPayloadText(shortUrl.trim());
            } else {
              throw new Error('Invalid response from shortener');
            }
          } catch (err) {
            setShortLinkForm((prev) => ({
              ...prev,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Failed to shorten URL',
            }));
          }
        }}
      >
        {shortLinkForm.isLoading
          ? t('actions.shortening', 'Shortening...')
          : t('actions.shortenUrl', 'Shorten URL')}
      </button>

      {shortLinkForm.error && <p className="text-xs text-destructive">{shortLinkForm.error}</p>}

      {/* Result */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.shortUrl', 'Short URL')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder={t('placeholders.generatedShortUrl', 'Generated short URL will appear here')}
          data-testid={DynamicTestId.resolve('payload-shortlink-input', 'payload-shortlink-input')}
          className={
            payload.validate && payload.text && !isValidUrl(payload.text)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
          readOnly={shortLinkForm.shortUrl !== ''}
        />
        {payload.validate && payload.text && !isValidUrl(payload.text) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t(
          'hints.shortLinkAuto',
          'Enter a long URL above and click "Shorten URL" to generate a short link.'
        )}
      </p>
    </div>
  );
}

function UtmLinkEditor({
  payload,
  setPayloadUrl,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadUrl' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.baseUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.url.href}
          onChange={(e) => setPayloadUrl({ href: e.target.value })}
          placeholder="https://anqr.link/landing"
          className={
            payload.validate && payload.url.href && !isValidUrl(payload.url.href)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.url.href && !isValidUrl(payload.url.href) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignSource')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmSource || ''}
          onChange={(e) => setPayloadUrl({ utmSource: e.target.value })}
          placeholder="qr_code"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignMedium')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmMedium || ''}
          onChange={(e) => setPayloadUrl({ utmMedium: e.target.value })}
          placeholder="print"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmCampaign || ''}
          onChange={(e) => setPayloadUrl({ utmCampaign: e.target.value })}
          placeholder="summer_sale_2024"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignTerm')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmTerm || ''}
          onChange={(e) => setPayloadUrl({ utmTerm: e.target.value })}
          placeholder="keyword"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignContent')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmContent || ''}
          onChange={(e) => setPayloadUrl({ utmContent: e.target.value })}
          placeholder="banner_ad"
        />
      </div>
    </div>
  );
}

function AppLinkEditor({
  payload,
  setPayloadAppLink,
  setPayloadText,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadAppLink' | 'setPayloadText' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.platform')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.appLink.platform}
          onValueChange={(v) =>
            setPayloadAppLink({ platform: v as typeof payload.appLink.platform })
          }
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-applink-platform-select',
              'payload-applink-platform-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="universal">{t('payload.universalLink')}</SelectItem>
            <SelectItem value="android">{t('payload.androidIntent')}</SelectItem>
            <SelectItem value="ios">iOS URL Scheme</SelectItem>
            <SelectItem value="custom">{t('payload.customScheme')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {payload.appLink.platform === 'universal' && (
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.deepLinkUrl')}</HighlightedLabel>
          </Label>
          <Input
            value={payload.text}
            onChange={(e) => setPayloadText(e.target.value)}
            placeholder="https://myapp.com/path/to/content"
            data-testid={DynamicTestId.resolve(
              'payload-applink-url-input',
              'payload-applink-url-input'
            )}
            className={
              payload.validate && payload.text && !isValidUrl(payload.text)
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
          {payload.validate && payload.text && !isValidUrl(payload.text) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidUrl',
                'Enter a valid URL (must start with http:// or https://)'
              )}
            </p>
          )}
        </div>
      )}
      {payload.appLink.platform !== 'universal' && (
        <>
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('payload.scheme')}</HighlightedLabel>
            </Label>
            <Input
              value={payload.appLink.scheme || ''}
              onChange={(e) => setPayloadAppLink({ scheme: e.target.value })}
              placeholder={payload.appLink.platform === 'android' ? 'https' : 'myapp'}
              data-testid={DynamicTestId.resolve(
                'payload-applink-scheme-input',
                'payload-applink-scheme-input'
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('payload.host')}</HighlightedLabel>
              </Label>
              <Input
                value={payload.appLink.host || ''}
                onChange={(e) => setPayloadAppLink({ host: e.target.value })}
                placeholder="myapp.com"
                data-testid={DynamicTestId.resolve(
                  'payload-applink-host-input',
                  'payload-applink-host-input'
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('payload.path')}</HighlightedLabel>
              </Label>
              <Input
                value={payload.appLink.path || ''}
                onChange={(e) => setPayloadAppLink({ path: e.target.value })}
                placeholder="/page/content"
                data-testid={DynamicTestId.resolve(
                  'payload-applink-path-input',
                  'payload-applink-path-input'
                )}
              />
            </div>
          </div>
          {payload.appLink.platform === 'android' && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('payload.packageName')}</HighlightedLabel>
              </Label>
              <Input
                value={payload.appLink.package || ''}
                onChange={(e) => setPayloadAppLink({ package: e.target.value })}
                placeholder="com.example.myapp"
                data-testid={DynamicTestId.resolve(
                  'payload-applink-package-input',
                  'payload-applink-package-input'
                )}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('payload.fallbackUrl')}</HighlightedLabel>
            </Label>
            <Input
              type="url"
              value={payload.appLink.fallbackUrl || ''}
              onChange={(e) => setPayloadAppLink({ fallbackUrl: e.target.value })}
              placeholder="https://anqr.link/app"
              data-testid={DynamicTestId.resolve(
                'payload-applink-fallback-input',
                'payload-applink-fallback-input'
              )}
            />
          </div>
        </>
      )}
      <p className="text-xs text-muted-foreground">{t('hints.appLinkNote')}</p>
    </div>
  );
}

function Gs1DigitalLinkEditor({
  payload,
  setPayloadGS1,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadGS1' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.gtin')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.gs1.gtin || ''}
          onChange={(e) => setPayloadGS1({ gtin: e.target.value })}
          placeholder="01234567890128"
          data-testid={DynamicTestId.resolve('payload-gs1-gtin-input', 'payload-gs1-gtin-input')}
          className={
            payload.validate && payload.gs1.gtin && !isValidGTIN(payload.gs1.gtin)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.gs1.gtin && !isValidGTIN(payload.gs1.gtin) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidGTIN', 'Enter a valid GTIN (8, 12, 13, or 14 digits)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.serialNumber')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.gs1.serial || ''}
          onChange={(e) => setPayloadGS1({ serial: e.target.value })}
          placeholder="ABC123"
          data-testid={DynamicTestId.resolve(
            'payload-gs1-serial-input',
            'payload-gs1-serial-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.batchLot')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.gs1.batch || ''}
          onChange={(e) => setPayloadGS1({ batch: e.target.value })}
          placeholder="LOT123"
          data-testid={DynamicTestId.resolve('payload-gs1-batch-input', 'payload-gs1-batch-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.expiryDate')}</HighlightedLabel>
        </Label>
        <Input
          type="date"
          value={payload.gs1.expiry || ''}
          onChange={(e) => setPayloadGS1({ expiry: e.target.value })}
          data-testid={DynamicTestId.resolve(
            'payload-gs1-expiry-input',
            'payload-gs1-expiry-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.resolverDomain')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.gs1.resolver || 'id.gs1.org'}
          onChange={(e) => setPayloadGS1({ resolver: e.target.value })}
          placeholder="id.gs1.org"
          data-testid={DynamicTestId.resolve(
            'payload-gs1-resolver-input',
            'payload-gs1-resolver-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.gs1Note')}</p>
    </div>
  );
}

function RemovedInventoryEditor({
  payload,
  setPayloadText,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadText' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.assetItemId')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder="ASSET-001234"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.assetType')}</HighlightedLabel>
        </Label>
        <Select defaultValue="equipment">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equipment">{t('payload.equipment')}</SelectItem>
            <SelectItem value="furniture">{t('payload.furniture')}</SelectItem>
            <SelectItem value="it">IT Asset</SelectItem>
            <SelectItem value="vehicle">{t('payload.vehicle')}</SelectItem>
            <SelectItem value="inventory">{t('payload.inventoryItem')}</SelectItem>
            <SelectItem value="other">{t('payload.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
        </Label>
        <Input placeholder="Building A, Room 101" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
        </Label>
        <Input placeholder="Dell Laptop 15-inch" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.lookupUrl')}</HighlightedLabel>
        </Label>
        <Input type="url" placeholder="https://inventory.anqr.link/asset/" />
      </div>
    </div>
  );
}

function RemovedTicketingEditor({
  payload,
  setPayloadText,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadText' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.ticketId')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder="TKT-2024-001234"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.eventName')}</HighlightedLabel>
        </Label>
        <Input placeholder="Concert 2024" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.venue')}</HighlightedLabel>
        </Label>
        <Input placeholder="Stadium Arena" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.dateTime')}</HighlightedLabel>
        </Label>
        <Input type="datetime-local" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.sectionZone')}</HighlightedLabel>
          </Label>
          <Input placeholder="Section A" />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.seat')}</HighlightedLabel>
          </Label>
          <Input placeholder="Row 5, Seat 12" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.attendeeName')}</HighlightedLabel>
        </Label>
        <Input placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.validationUrl')}</HighlightedLabel>
        </Label>
        <Input type="url" placeholder="https://tickets.anqr.link/validate/" />
      </div>
    </div>
  );
}

function CustomEditor({
  payload,
  setPayloadText,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadText' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.rawData')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder={t('placeholders.rawQrData')}
          rows={6}
          className="font-mono text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.customNote')}</p>
    </div>
  );
}

function ValidationOptionsEditor({
  getPayloadText,
  payload,
  qr,
  setPayloadValidation,
  t,
}: Readonly<
  Pick<EditorProps, 'getPayloadText' | 'payload' | 'qr' | 'setPayloadValidation' | 't'>
>) {
  return (
    <div className="space-y-2 pt-4 border-t">
      <Label className="text-muted-foreground text-xs">
        <HighlightedLabel>{t('payload.validationOptions')}</HighlightedLabel>
      </Label>
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          <HighlightedLabel>{t('payload.validateInput')}</HighlightedLabel>
        </Label>
        <Switch
          checked={payload.validate}
          onCheckedChange={(checked) => setPayloadValidation({ validate: checked })}
          title={t('hints.validateInput')}
          data-testid={DynamicTestId.resolve('payload-validate-switch', 'payload-validate-switch')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          <HighlightedLabel>{t('payload.trimWhitespace')}</HighlightedLabel>
        </Label>
        <Switch
          checked={payload.trim}
          onCheckedChange={(checked) => setPayloadValidation({ trim: checked })}
          title={t('hints.trimWhitespace')}
          data-testid={DynamicTestId.resolve('payload-trim-switch', 'payload-trim-switch')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          <HighlightedLabel>{t('payload.normalizeNewlines')}</HighlightedLabel>
        </Label>
        <Switch
          checked={payload.normalizeNewlines}
          onCheckedChange={(checked) => setPayloadValidation({ normalizeNewlines: checked })}
          title={t('hints.normalizeNewlines')}
          data-testid={DynamicTestId.resolve(
            'payload-normalize-newlines-switch',
            'payload-normalize-newlines-switch'
          )}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          <HighlightedLabel>{t('payload.maxLengthGuard')}</HighlightedLabel>
        </Label>
        <Switch
          checked={payload.maxLenGuard}
          onCheckedChange={(checked) => setPayloadValidation({ maxLenGuard: checked })}
          title={t('hints.maxLengthGuard')}
          data-testid={DynamicTestId.resolve(
            'payload-max-len-guard-switch',
            'payload-max-len-guard-switch'
          )}
        />
      </div>
      {/* Max Length Guard Indicator */}
      {payload.maxLenGuard &&
        (() => {
          const payloadText = getPayloadText();
          const byteLength = new TextEncoder().encode(payloadText).length;
          // Use version from settings, or max (40) if auto (0)
          const effectiveVersion = qr.version > 0 ? qr.version : 40;
          const maxCapacity = ECC_CAPACITIES_BYTE[qr.ecc]?.[effectiveVersion - 1] || 2953;
          const percentage = Math.round((byteLength / maxCapacity) * 100);
          const isWarning = percentage > 70 && percentage <= 90;
          const isDanger = percentage > 90;

          return (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('payload.contentSize', 'Content size')}
                </span>
                <span
                  className={
                    isDanger
                      ? 'text-destructive font-medium'
                      : isWarning
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-muted-foreground'
                  }
                >
                  {byteLength} / {maxCapacity} {t('common.bytes', 'bytes')} ({percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDanger ? 'bg-destructive' : isWarning ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {isDanger && (
                <p className="text-xs text-destructive">
                  {t(
                    'validation.contentTooLong',
                    'Content may exceed QR capacity. Consider reducing content or lowering ECC level.'
                  )}
                </p>
              )}
            </div>
          );
        })()}
    </div>
  );
}

export function PayloadSection() {
  const {
    tier,
    payload,
    qr,
    getPayloadText,
    setPayloadKind,
    setPayloadText,
    setPayloadUrl,
    setPayloadTel,
    setPayloadEmail,
    setPayloadSms,
    setPayloadGeo,
    setPayloadWifi,
    setPayloadVCard,
    setPayloadMeCard,
    setPayloadEvent,
    setPayloadCrypto,
    setPayloadOtpAuth,
    setPayloadValidation,
    setPayloadBizCard,
    setPayloadMessaging,
    setPayloadSocialProfile,
    setPayloadAppLink,
    setPayloadGS1,
    setPayloadCalendarSub,
    setPayloadEventRsvp,
    setPayloadSwissQRBill,
    setPayloadLightning,
    setPayloadEthereum,
    setPayloadQRIS,
    setPayloadDuitNow,
    setPayloadBharatQR,
    setPayloadVietQR,
    setPayloadQRPh,
    setPayloadTWQR,
    setPayloadHKQR,
    setPayloadJPQR,
    setPayloadAusPayNet,
    setPayloadPayPalMe,
    setPayloadCashApp,
    setPayloadEMVGeneric,
  } = useQRStore();
  const { t } = useTranslation();
  const [showStartupHighlight, setShowStartupHighlight] = useState(false);

  const {
    epcSepaForm,
    setEpcSepaForm,
    upiForm,
    setUpiForm,
    payNowForm,
    setPayNowForm,
    promptPayForm,
    setPromptPayForm,
    pixForm,
    setPixForm,
    swissQrBillForm,
    setSwissQrBillForm,
    lightningForm,
    setLightningForm,
    ethereumForm,
    setEthereumForm,
    qrisForm,
    setQrisForm,
    duitnowForm,
    setDuitnowForm,
    bharatqrForm,
    setBharatqrForm,
    vietqrForm,
    setVietqrForm,
    qrphForm,
    setQrphForm,
    twqrForm,
    setTwqrForm,
    hkqrForm,
    setHkqrForm,
    jpqrForm,
    setJpqrForm,
    auspaynetForm,
    setAuspaynetForm,
    paypalMeForm,
    setPaypalMeForm,
    cashappForm,
    setCashappForm,
    emvGenericForm,
    setEmvGenericForm,
    shortLinkForm,
    setShortLinkForm,
  } = usePaymentFormStates();

  useEffect(() => {
    const hasSeenHighlight = sessionStorage.getItem('anqr-seen-highlight');
    if (!hasSeenHighlight) {
      setShowStartupHighlight(true);
      sessionStorage.setItem('anqr-seen-highlight', 'true');
      const timer = setTimeout(() => setShowStartupHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  usePaymentFormSync(
    payload.kind,
    {
      epcSepaForm,
      upiForm,
      payNowForm,
      promptPayForm,
      pixForm,
      swissQrBillForm,
      lightningForm,
      ethereumForm,
      qrisForm,
      duitnowForm,
      bharatqrForm,
      vietqrForm,
      qrphForm,
      twqrForm,
      hkqrForm,
      jpqrForm,
      auspaynetForm,
      paypalMeForm,
      cashappForm,
      emvGenericForm,
    },
    {
      setPayloadText,
      setPayloadSwissQRBill,
      setPayloadLightning,
      setPayloadEthereum,
      setPayloadQRIS,
      setPayloadDuitNow,
      setPayloadBharatQR,
      setPayloadVietQR,
      setPayloadQRPh,
      setPayloadTWQR,
      setPayloadHKQR,
      setPayloadJPQR,
      setPayloadAusPayNet,
      setPayloadPayPalMe,
      setPayloadCashApp,
      setPayloadEMVGeneric,
    }
  );

  const editorProps: EditorProps = {
    payload,
    tier,
    t,
    showStartupHighlight,
    setShowStartupHighlight,
    setPayloadText,
    setPayloadUrl,
    setPayloadTel,
    setPayloadEmail,
    setPayloadSms,
    setPayloadGeo,
    setPayloadWifi,
    setPayloadVCard,
    setPayloadMeCard,
    setPayloadEvent,
    setPayloadCrypto,
    setPayloadOtpAuth,
    setPayloadBizCard,
    setPayloadMessaging,
    setPayloadSocialProfile,
    setPayloadAppLink,
    setPayloadGS1,
    setPayloadCalendarSub,
    setPayloadEventRsvp,
    setPayloadValidation,
    getPayloadText,
    qr,
    epcSepaForm,
    setEpcSepaForm,
    upiForm,
    setUpiForm,
    payNowForm,
    setPayNowForm,
    promptPayForm,
    setPromptPayForm,
    pixForm,
    setPixForm,
    swissQrBillForm,
    setSwissQrBillForm,
    lightningForm,
    setLightningForm,
    ethereumForm,
    setEthereumForm,
    qrisForm,
    setQrisForm,
    duitnowForm,
    setDuitnowForm,
    bharatqrForm,
    setBharatqrForm,
    vietqrForm,
    setVietqrForm,
    qrphForm,
    setQrphForm,
    twqrForm,
    setTwqrForm,
    hkqrForm,
    setHkqrForm,
    jpqrForm,
    setJpqrForm,
    auspaynetForm,
    setAuspaynetForm,
    paypalMeForm,
    setPaypalMeForm,
    cashappForm,
    setCashappForm,
    emvGenericForm,
    setEmvGenericForm,
    shortLinkForm,
    setShortLinkForm,
  };

  return (
    <div className="space-y-4">
      {/* Payload Type Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t('payload.contentType')}</HighlightedLabel>
          </Label>
          <HelpLink href="/guide#section-0" />
        </div>
        <Select value={payload.kind} onValueChange={(v) => setPayloadKind(v as PayloadKind)}>
          <SelectTrigger
            className="w-full"
            title={t('hints.selectContentType')}
            data-testid={DynamicTestId.resolve(
              'payload-content-type-select',
              'payload-content-type-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[400px]">
            {PAYLOAD_CATEGORY_KEYS.filter((cat) => {
              if (cat.tier === 'basic') return true;
              if (cat.tier === 'advanced') return tier === 'advanced' || tier === 'professional';
              if (cat.tier === 'professional') return tier === 'professional';
              return false;
            }).map((cat) => {
              // Get available payment methods for current language/tier
              const currentLang = i18n.language || 'en';
              const availablePayments = getAvailablePayments(tier, currentLang);

              // Filter items for the payments category based on language
              const filteredItems =
                cat.groupKey === 'payload.payments'
                  ? cat.items.filter((item) => availablePayments.includes(item.value))
                  : cat.items;

              // Don't render empty categories
              if (filteredItems.length === 0) return null;

              return (
                <SelectGroup key={cat.groupKey}>
                  <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5 bg-muted/50">
                    {t(cat.groupKey)}
                  </SelectLabel>
                  {filteredItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {t(item.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Plain Text Input */}

      {payload.kind === 'plain_text' && <PlainTextEditor {...editorProps} />}
      {payload.kind === 'url' && <UrlEditor {...editorProps} />}
      {payload.kind === 'tel' && <TelEditor {...editorProps} />}
      {payload.kind === 'email' && <EmailEditor {...editorProps} />}
      {payload.kind === 'sms' && <SmsEditor {...editorProps} />}
      {payload.kind === 'geo' && <GeoEditor {...editorProps} />}
      {payload.kind === 'wifi' && <WifiEditor {...editorProps} />}
      {payload.kind === 'vcard' && <VcardEditor {...editorProps} />}
      {payload.kind === 'mecard' && <MecardEditor {...editorProps} />}
      {payload.kind === 'bizcard' && <BizcardEditor {...editorProps} />}
      {(payload.kind as string) === 'bluetooth' && <BluetoothEditor {...editorProps} />}
      {payload.kind === 'event' && <EventEditor {...editorProps} />}
      {payload.kind === 'event_rsvp' && <EventRsvpEditor {...editorProps} />}
      {payload.kind === 'calendar_subscription' && <CalendarSubscriptionEditor {...editorProps} />}
      {payload.kind === 'social_profile' && <SocialProfileEditor {...editorProps} />}
      {payload.kind === 'messaging_link' && <MessagingLinkEditor {...editorProps} />}
      {payload.kind === 'crypto' && <CryptoEditor {...editorProps} />}
      {payload.kind === 'epc_sepa' && <EpcSepaEditor {...editorProps} />}
      {payload.kind === 'upi' && <UpiEditor {...editorProps} />}
      {payload.kind === 'paynow' && <PaynowEditor {...editorProps} />}
      {payload.kind === 'promptpay' && <PromptpayEditor {...editorProps} />}
      {payload.kind === 'pix' && <PixEditor {...editorProps} />}
      {payload.kind === 'swiss_qr_bill' && <SwissQrBillEditor {...editorProps} />}
      {payload.kind === 'lightning' && <LightningEditor {...editorProps} />}
      {payload.kind === 'ethereum_eip681' && <EthereumEip681Editor {...editorProps} />}
      {payload.kind === 'qris' && <QrisEditor {...editorProps} />}
      {payload.kind === 'duitnow' && <DuitnowEditor {...editorProps} />}
      {payload.kind === 'bharatqr' && <BharatqrEditor {...editorProps} />}
      {payload.kind === 'vietqr' && <VietqrEditor {...editorProps} />}
      {payload.kind === 'qrph' && <QrphEditor {...editorProps} />}
      {payload.kind === 'twqr' && <TwqrEditor {...editorProps} />}
      {payload.kind === 'hkqr' && <HkqrEditor {...editorProps} />}
      {payload.kind === 'jpqr' && <JpqrEditor {...editorProps} />}
      {payload.kind === 'auspaynet' && <AuspaynetEditor {...editorProps} />}
      {payload.kind === 'paypal_me' && <PaypalMeEditor {...editorProps} />}
      {payload.kind === 'cashapp' && <CashappEditor {...editorProps} />}
      {payload.kind === 'emv_generic' && <EmvGenericEditor {...editorProps} />}
      {(payload.kind as string) === '_removed_otpauth' && <RemovedOtpauthEditor {...editorProps} />}
      {payload.kind === 'short_link' && <ShortLinkEditor {...editorProps} />}
      {payload.kind === 'utm_link' && <UtmLinkEditor {...editorProps} />}
      {payload.kind === 'app_link' && <AppLinkEditor {...editorProps} />}
      {payload.kind === 'gs1_digital_link' && <Gs1DigitalLinkEditor {...editorProps} />}
      {(payload.kind as string) === '_removed_inventory' && (
        <RemovedInventoryEditor {...editorProps} />
      )}
      {(payload.kind as string) === '_removed_ticketing' && (
        <RemovedTicketingEditor {...editorProps} />
      )}
      {payload.kind === 'custom' && <CustomEditor {...editorProps} />}

      {(tier === 'advanced' || tier === 'professional') && (
        <ValidationOptionsEditor {...editorProps} />
      )}
    </div>
  );
}
