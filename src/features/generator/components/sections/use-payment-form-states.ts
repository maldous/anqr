import { useState } from 'react';
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

export function usePaymentFormStates() {
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
  const [pixForm, setPixForm] = useState<PIXForm>({ key: '', name: '', city: '', amount: '' });
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
  const [lightningForm, setLightningForm] = useState<LightningForm>({ invoice: '' });
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
  const [hkqrForm, setHkqrForm] = useState<HKQRForm>({ fpsId: '', merchantName: '', amount: '' });
  const [jpqrForm, setJpqrForm] = useState<JPQRForm>({ storeId: '', merchantName: '', amount: '' });
  const [auspaynetForm, setAuspaynetForm] = useState<AusPayNetForm>({
    payId: '',
    payIdType: 'EMAIL',
    merchantName: '',
    amount: '',
  });
  const [paypalMeForm, setPaypalMeForm] = useState<PayPalMeForm>({ username: '', amount: '' });
  const [cashappForm, setCashappForm] = useState<CashAppForm>({ cashtag: '', amount: '' });
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
