import { useEffect } from 'react';
import {
  generateEPCSepa,
  generatePayNow,
  generatePIX,
  generatePromptPay,
  generateUPI,
} from '@/modules/payload-generators';
import type { PayloadKind, QRState } from '@/store/qr-store';
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
  SwissQRBillForm,
  TWQRForm,
  UPIForm,
  VietQRForm,
} from './payload-section-types';
export { usePaymentFormStates } from './use-payment-form-states';

export function usePaymentFormSync(
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
      setPayloadText(
        generateEPCSepa({
          name: epcSepaForm.name,
          iban: epcSepaForm.iban,
          bic: epcSepaForm.bic || undefined,
          amount: epcSepaForm.amount ? Number.parseFloat(epcSepaForm.amount) : undefined,
          reference: epcSepaForm.reference || undefined,
        })
      );
    }
  }, [payloadKind, epcSepaForm, setPayloadText]);
  useEffect(() => {
    if (payloadKind === 'upi' && upiForm.vpa) {
      setPayloadText(
        generateUPI({
          pa: upiForm.vpa,
          pn: upiForm.payeeName || undefined,
          am: upiForm.amount ? Number.parseFloat(upiForm.amount) : undefined,
          tn: upiForm.transactionNote || undefined,
        })
      );
    }
  }, [payloadKind, upiForm, setPayloadText]);
  useEffect(() => {
    if (payloadKind === 'paynow' && payNowForm.value) {
      setPayloadText(
        generatePayNow({
          type: payNowForm.type,
          value: payNowForm.value,
          amount: payNowForm.amount ? Number.parseFloat(payNowForm.amount) : undefined,
          reference: payNowForm.reference || undefined,
          editable: true,
        })
      );
    }
  }, [payloadKind, payNowForm, setPayloadText]);
  useEffect(() => {
    if (payloadKind === 'promptpay' && promptPayForm.value) {
      setPayloadText(
        generatePromptPay({
          type: promptPayForm.type,
          value: promptPayForm.value,
          amount: promptPayForm.amount ? Number.parseFloat(promptPayForm.amount) : undefined,
        })
      );
    }
  }, [payloadKind, promptPayForm, setPayloadText]);
  useEffect(() => {
    if (payloadKind === 'pix' && pixForm.key) {
      setPayloadText(
        generatePIX({
          key: pixForm.key,
          name: pixForm.name || undefined,
          city: pixForm.city || undefined,
          amount: pixForm.amount ? Number.parseFloat(pixForm.amount) : undefined,
        })
      );
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
