import { payloadCategory } from './payload-category';

export const PAYLOAD_CATEGORY_KEYS = [
  payloadCategory('payload.core', 'basic', [
    ['plain_text', 'payload.plainText'],
    ['url', 'payload.url'],
  ]),
  payloadCategory('payload.contact', 'advanced', [
    ['tel', 'payload.tel'],
    ['email', 'payload.email'],
    ['sms', 'payload.smsMms'],
    ['vcard', 'payload.vcard'],
    ['mecard', 'payload.mecard'],
    ['bizcard', 'payload.bizcard'],
  ]),
  payloadCategory('payload.locationNetwork', 'advanced', [
    ['geo', 'payload.geo'],
    ['wifi', 'payload.wifiNetwork'],
  ]),
  payloadCategory('payload.calendar', 'advanced', [
    ['event', 'payload.event'],
    ['event_rsvp', 'payload.eventRsvp'],
    ['calendar_subscription', 'payload.calendarSubscription'],
  ]),
  payloadCategory('payload.socialMessaging', 'advanced', [
    ['social_profile', 'payload.socialProfile'],
    ['messaging_link', 'payload.messagingLink'],
  ]),
  payloadCategory('payload.payments', 'advanced', [
    ['epc_sepa', 'payload.epcSepa'],
    ['swiss_qr_bill', 'payload.swissQrBill'],
    ['upi', 'payload.upi'],
    ['paynow', 'payload.paynow'],
    ['promptpay', 'payload.promptpay'],
    ['pix', 'payload.pix'],
    ['qris', 'payload.qris'],
    ['duitnow', 'payload.duitnow'],
    ['bharatqr', 'payload.bharatqr'],
    ['vietqr', 'payload.vietqr'],
    ['qrph', 'payload.qrph'],
    ['twqr', 'payload.twqr'],
    ['hkqr', 'payload.hkqr'],
    ['jpqr', 'payload.jpqr'],
    ['auspaynet', 'payload.auspaynet'],
    ['crypto', 'payload.crypto'],
    ['lightning', 'payload.lightning'],
    ['ethereum_eip681', 'payload.ethereumEip681'],
    ['paypal_me', 'payload.paypalMe'],
    ['cashapp', 'payload.cashapp'],
    ['emv_generic', 'payload.emvGeneric'],
  ]),
  payloadCategory('payload.marketing', 'professional', [
    ['utm_link', 'payload.utmLink'],
    ['short_link', 'payload.shortLink'],
  ]),
  payloadCategory('payload.enterprise', 'professional', [
    ['gs1_digital_link', 'payload.gs1DigitalLink'],
    ['app_link', 'payload.appLink'],
    ['custom', 'payload.custom'],
  ]),
] as const;
