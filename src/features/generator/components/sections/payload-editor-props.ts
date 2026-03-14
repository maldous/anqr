import type React from 'react';
import type { useTranslation } from 'react-i18next';
import type { QRState } from '@/store/qr-store';
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

export interface EditorProps {
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
