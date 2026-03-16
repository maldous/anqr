import type {
  AppLinkHelper,
  AusPayNetHelper,
  BharatQRHelper,
  BizCardHelper,
  CalendarSubHelper,
  CashAppHelper,
  CloudLinkHelper,
  DuitNowHelper,
  EMVGenericHelper,
  EthereumHelper,
  EventRsvpHelper,
  GS1Helper,
  HKQRHelper,
  JPQRHelper,
  LightningHelper,
  MessagingHelper,
  OtpAuthHelper,
  PayloadKind,
  PayPalMeHelper,
  QRISHelper,
  QRPhHelper,
  SocialProfileHelper,
  SwissQRBillHelper,
  TWQRHelper,
  VietQRHelper,
} from "./";
import type {
  CryptoHelper,
  EmailHelper,
  EventHelper,
  GeoHelper,
  MeCardHelper,
  SmsHelper,
  TelHelper,
  UrlHelper,
  VCardHelper,
  WifiHelper,
} from "@/modules/payload-generators";

export interface PayloadData {
  kind: PayloadKind;
  text: string;
  url: UrlHelper;
  tel: TelHelper;
  email: EmailHelper;
  sms: SmsHelper;
  geo: GeoHelper;
  wifi: WifiHelper;
  vcard: VCardHelper;
  mecard: MeCardHelper;
  event: EventHelper;
  crypto: CryptoHelper;
  otpauth: OtpAuthHelper;
  bizcard: BizCardHelper;
  messaging: MessagingHelper;
  socialProfile: SocialProfileHelper;
  appLink: AppLinkHelper;
  gs1: GS1Helper;
  cloudLink: CloudLinkHelper;
  calendarSub: CalendarSubHelper;
  eventRsvp: EventRsvpHelper;
  swissQRBill: SwissQRBillHelper;
  lightning: LightningHelper;
  ethereum: EthereumHelper;
  qris: QRISHelper;
  duitnow: DuitNowHelper;
  bharatqr: BharatQRHelper;
  vietqr: VietQRHelper;
  qrph: QRPhHelper;
  twqr: TWQRHelper;
  hkqr: HKQRHelper;
  jpqr: JPQRHelper;
  auspaynet: AusPayNetHelper;
  paypalMe: PayPalMeHelper;
  cashapp: CashAppHelper;
  emvGeneric: EMVGenericHelper;
  validate: boolean;
  normalizeNewlines: boolean;
  trim: boolean;
  maxLenGuard: boolean;
}
