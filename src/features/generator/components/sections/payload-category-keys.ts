import type { PayloadKind } from '@/store/qr-store';

export const PAYLOAD_CATEGORY_KEYS = [
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
    tier: 'advanced' as const,
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
