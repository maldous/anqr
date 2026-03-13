import {
  generateBizCard,
  generateEvent,
  generateLightning,
  generateMeCard,
  generateMessagingLink,
  generateSocialProfile,
  generateVCard,
} from '@/modules/payload-generators';
import type { PayloadKind } from '../types';
import { applyPayloadTransforms } from './apply-payload-transforms';
import type { PayloadData } from './payload-data';
import type { PayloadSerializer } from './payload-serializer';
import { serializeAppLink } from './serialize-app-link';
import { serializeAusPayNet } from './serialize-aus-pay-net';
import { serializeBharatQR } from './serialize-bharat-qr';
import { serializeCalendarSubscription } from './serialize-calendar-subscription';
import { serializeCashApp } from './serialize-cash-app';
import { serializeCrypto } from './serialize-crypto';
import { serializeDuitNow } from './serialize-duit-now';
import { serializeEmail } from './serialize-email';
import { serializeEMVGeneric } from './serialize-emv-generic';
import { serializeEthereumEIP681 } from './serialize-ethereum-eip681';
import { serializeEventRsvp } from './serialize-event-rsvp';
import { serializeGS1DigitalLink } from './serialize-gs1-digital-link';
import { serializeHKQR } from './serialize-hkqr';
import { serializeJPQR } from './serialize-jpqr';
import { serializePayPalMe } from './serialize-pay-pal-me';
import { serializeQRIS } from './serialize-qris';
import { serializeQRPh } from './serialize-qr-ph';
import { serializeSms } from './serialize-sms';
import { serializeSwissQRBill } from './serialize-swiss-qr-bill';
import { serializeTWQR } from './serialize-twqr';
import { serializeUrlWithUtm } from './serialize-url-with-utm';
import { serializeVietQR } from './serialize-viet-qr';
import { serializeWifi } from './serialize-wifi';

export const PAYLOAD_SERIALIZERS: Partial<Record<PayloadKind, PayloadSerializer>> = {
  plain_text: (payload: PayloadData) => applyPayloadTransforms(payload.text, payload),
  url: serializeUrlWithUtm,
  tel: (payload: PayloadData) => `tel:${payload.tel.number}`,
  email: serializeEmail,
  sms: serializeSms,
  geo: (payload: PayloadData) => `geo:${payload.geo.lat},${payload.geo.lon}`,
  wifi: serializeWifi,
  vcard: (payload: PayloadData) => generateVCard(payload.vcard),
  mecard: (payload: PayloadData) => generateMeCard(payload.mecard),
  event: (payload: PayloadData) => generateEvent(payload.event),
  crypto: serializeCrypto,
  bizcard: (payload: PayloadData) => generateBizCard(payload.bizcard),
  calendar_subscription: serializeCalendarSubscription,
  event_rsvp: serializeEventRsvp,
  social_profile: (payload: PayloadData) =>
    generateSocialProfile(payload.socialProfile.platform, payload.socialProfile.username),
  messaging_link: (payload: PayloadData) =>
    generateMessagingLink(
      payload.messaging.platform,
      payload.messaging.identifier,
      payload.messaging.message
    ),
  gs1_digital_link: serializeGS1DigitalLink,
  app_link: serializeAppLink,
  utm_link: serializeUrlWithUtm,
  short_link: (payload: PayloadData) => payload.text,
  swiss_qr_bill: serializeSwissQRBill,
  lightning: (payload: PayloadData) =>
    payload.lightning.invoice ? generateLightning({ invoice: payload.lightning.invoice }) : '',
  ethereum_eip681: serializeEthereumEIP681,
  qris: serializeQRIS,
  duitnow: serializeDuitNow,
  bharatqr: serializeBharatQR,
  vietqr: serializeVietQR,
  qrph: serializeQRPh,
  twqr: serializeTWQR,
  hkqr: serializeHKQR,
  jpqr: serializeJPQR,
  auspaynet: serializeAusPayNet,
  paypal_me: serializePayPalMe,
  cashapp: serializeCashApp,
  emv_generic: serializeEMVGeneric,
  custom: (payload: PayloadData) => applyPayloadTransforms(payload.text, payload),
};
