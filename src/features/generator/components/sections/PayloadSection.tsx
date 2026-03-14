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
  AppLinkEditor,
  AuspaynetEditor,
  BharatqrEditor,
  BizcardEditor,
  BluetoothEditor,
  CashappEditor,
  CalendarSubscriptionEditor,
  CryptoEditor,
  CustomEditor,
  DuitnowEditor,
  EmvGenericEditor,
  EmailEditor,
  EpcSepaEditor,
  EthereumEip681Editor,
  EventEditor,
  EventRsvpEditor,
  GeoEditor,
  Gs1DigitalLinkEditor,
  HkqrEditor,
  JpqrEditor,
  LightningEditor,
  MecardEditor,
  MessagingLinkEditor,
  PaynowEditor,
  PixEditor,
  PlainTextEditor,
  PaypalMeEditor,
  PromptpayEditor,
  QrisEditor,
  QrphEditor,
  RemovedOtpauthEditor,
  RemovedInventoryEditor,
  RemovedTicketingEditor,
  ShortLinkEditor,
  SocialProfileEditor,
  SmsEditor,
  SwissQrBillEditor,
  TelEditor,
  TwqrEditor,
  UtmLinkEditor,
  UrlEditor,
  ValidationOptionsEditor,
  VietqrEditor,
  VcardEditor,
  WifiEditor,
  UpiEditor,
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
import { getAvailablePayments } from './payload-payment-config';
import { PAYLOAD_CATEGORY_KEYS } from './payload-category-keys';
import type { EditorProps } from './payload-editor-props';
import { PlusCodeDisplay } from './payload-plus-code-display';
import { usePaymentFormStates, usePaymentFormSync } from './payload-payment-form-hooks';

const log = createLogger('PAYLOAD');
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
