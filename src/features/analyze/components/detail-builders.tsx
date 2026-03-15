import { buildUrlDetails } from './build-url-details';
import { buildWifiDetails } from './build-wifi-details';
import { buildVCardDetails } from './build-v-card-details';
import { buildMeCardDetails } from './build-me-card-details';
import { buildEmailDetails } from './build-email-details';
import { buildTelDetails } from './build-tel-details';
import { buildSmsDetails } from './build-sms-details';
import { buildGeoDetails } from './build-geo-details';
import { buildCryptoDetails } from './build-crypto-details';
import { buildEpcSepaDetails } from './build-epc-sepa-details';
import { buildUpiDetails } from './build-upi-details';
import { buildEmvQrDetails } from './build-emv-qr-details';
import { buildSwissQrBillDetails } from './build-swiss-qr-bill-details';
import { buildCalendarEventDetails } from './build-calendar-event-details';
import { buildOtpAuthDetails } from './build-otp-auth-details';
import type { DetailEntry } from './detail-entry';

// ---------------------------------------------------------------------------
// Detail Builder Registry
// ---------------------------------------------------------------------------
export const DETAIL_BUILDERS: Record<string, (payload: string) => DetailEntry[]> = {
  url: buildUrlDetails,
  wifi: buildWifiDetails,
  vcard: buildVCardDetails,
  mecard: buildMeCardDetails,
  email: buildEmailDetails,
  tel: buildTelDetails,
  sms: buildSmsDetails,
  geo: buildGeoDetails,
  crypto_bitcoin: buildCryptoDetails,
  crypto_ethereum: buildCryptoDetails,
  crypto_other: buildCryptoDetails,
  epc_sepa: buildEpcSepaDetails,
  upi: buildUpiDetails,
  emv_qr: buildEmvQrDetails,
  swiss_qr_bill: buildSwissQrBillDetails,
  calendar_event: buildCalendarEventDetails,
  otp_auth: buildOtpAuthDetails,
};
