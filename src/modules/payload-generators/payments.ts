/**
 * Payment Payload Generators
 * EPC/SEPA, UPI, PayNow, PromptPay, PIX, Swiss QR Bill, Lightning, Ethereum, Crypto
 * National EMV payment schemes: QRIS, DuitNow, BharatQR, VietQR, QRPh, TWQR, HKQR, JPQR, AusPayNet
 */

import { EMVQRBuilder } from './emv';
import type {
  AusPayNetParams,
  BharatQRParams,
  CashAppParams,
  CryptoHelper,
  DuitNowParams,
  EMVMPMParams,
  EPCSepaParams,
  EthereumEIP681Params,
  HKQRParams,
  JPQRParams,
  LightningParams,
  PayNowParams,
  PayPalMeParams,
  PIXParams,
  PromptPayParams,
  QRISParams,
  QRPhParams,
  SwissQRBillParams,
  TWQRParams,
  UPIParams,
  VietQRParams,
} from './types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from './types';

/**
 * Generate EPC/SEPA payment QR code (EU bank transfer)
 */
export function generateEPCSepa(params: EPCSepaParams): string {
  const lines: string[] = [
    'BCD',
    '002',
    '1',
    'SCT',
    params.bic || '',
    params.name.substring(0, 70),
    params.iban.replaceAll(/\s/g, '').toUpperCase(),
  ];

  if (params.amount !== undefined && params.amount > 0) {
    lines.push(`EUR${params.amount.toFixed(2)}`);
  } else {
    lines.push('');
  }

  lines.push(
    '',
    params.reference?.substring(0, 35) || '',
    params.text?.substring(0, 140) || '',
    ''
  );

  return lines.join('\n');
}

/**
 * Generate UPI payment URI (India)
 */
export function generateUPI(params: UPIParams): string {
  const queryParams = new URLSearchParams();

  queryParams.set('pa', params.pa);

  if (params.pn) queryParams.set('pn', params.pn);
  if (params.am !== undefined && params.am > 0) queryParams.set('am', params.am.toFixed(2));
  queryParams.set('cu', params.cu || 'INR');
  if (params.tn) queryParams.set('tn', params.tn.substring(0, 50));
  if (params.tr) queryParams.set('tr', params.tr.substring(0, 35));
  if (params.mc) queryParams.set('mc', params.mc);
  if (params.tid) queryParams.set('tid', params.tid);
  if (params.url) queryParams.set('url', params.url);
  if (params.mode) queryParams.set('mode', params.mode);
  if (params.purpose) queryParams.set('purpose', params.purpose);
  if (params.orgid) queryParams.set('orgid', params.orgid);
  if (params.sign) queryParams.set('sign', params.sign);

  return `upi://pay?${queryParams.toString()}`;
}

/**
 * Generate PayNow QR code (Singapore)
 */
export function generatePayNow(params: PayNowParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const proxyTypeCode = {
    mobile: '0',
    uen: '2',
    nric: '1',
  }[params.type];

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: '01', value: proxyTypeCode },
    { tag: '02', value: params.value },
    { tag: '03', value: params.editable ? '1' : '0' },
  ];
  if (params.expiryDate) {
    maiData.push({ tag: '04', value: params.expiryDate });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.PAYNOW, maiData);
  builder.setTransactionCurrency(ISO_CURRENCY.SGD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('SG');

  if (params.merchantName) {
    builder.setMerchantName(params.merchantName);
  }
  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}

/**
 * Generate PromptPay QR code (Thailand)
 */
export function generatePromptPay(params: PromptPayParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const aidMap = {
    mobile: PAYMENT_SCHEME_GUI.PROMPTPAY_MOBILE,
    id: PAYMENT_SCHEME_GUI.PROMPTPAY_TAX_ID,
    ewallet: PAYMENT_SCHEME_GUI.PROMPTPAY_EWALLET,
    billpay: PAYMENT_SCHEME_GUI.PROMPTPAY_BILLPAY,
  };
  const aid = aidMap[params.type];

  let formattedValue = params.value.replaceAll(/[\s-]/g, '');
  if (params.type === 'mobile' && formattedValue.startsWith('0')) {
    formattedValue = `66${formattedValue.substring(1)}`;
  }

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: formattedValue }];

  if (params.type === 'billpay') {
    if (params.ref1) maiData.push({ tag: '02', value: params.ref1 });
    if (params.ref2) maiData.push({ tag: '03', value: params.ref2 });
  }

  builder.addMerchantAccountInfo(29, aid, maiData);

  if (params.type === 'billpay' && params.ref3) {
    builder.addMerchantAccountInfo(30, PAYMENT_SCHEME_GUI.PROMPTPAY_BILLPAY, [
      { tag: '01', value: params.ref3 },
    ]);
  }

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.THB);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode(params.countryCode || 'TH');

  if (params.merchantName) {
    builder.setMerchantName(params.merchantName);
  }
  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}

/**
 * Generate PIX QR code (Brazil)
 */
export function generatePIX(params: PIXParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: params.key }];
  if (params.description) {
    maiData.push({ tag: '02', value: params.description.substring(0, 72) });
  }
  if (params.url) {
    maiData.push({ tag: '25', value: params.url });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.PIX, maiData);
  builder.setMCC('0000');
  builder.setTransactionCurrency(ISO_CURRENCY.BRL);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('BR');

  if (params.name) {
    builder.setMerchantName(params.name);
  }
  if (params.city) {
    builder.setMerchantCity(params.city);
  }
  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  if (params.txid) {
    builder.setAdditionalData({ referenceLabel: params.txid });
  }

  return builder.build();
}

/**
 * Generate Swiss QR-bill payment code
 */
export function generateSwissQRBill(params: SwissQRBillParams): string {
  const lines: string[] = ['SPC', params.version || '0200', '1'];

  lines.push(
    params.creditorIBAN.replaceAll(/\s/g, '').toUpperCase(),
    params.creditorAddressType,
    params.creditorName.substring(0, 70),
    ...(params.creditorAddressType === 'S'
      ? [
          params.creditorStreet?.substring(0, 70) || '',
          params.creditorBuildingNumber?.substring(0, 16) || '',
          params.creditorPostalCode?.substring(0, 16) || '',
          params.creditorCity?.substring(0, 35) || '',
        ]
      : [
          params.creditorStreet?.substring(0, 70) || '',
          params.creditorCity?.substring(0, 70) || '',
          '',
          '',
        ]),
    params.creditorCountry.toUpperCase()
  );

  lines.push(
    params.ultimateCreditorAddressType || '',
    params.ultimateCreditorName?.substring(0, 70) || '',
    ...(params.ultimateCreditorAddressType === 'S'
      ? [
          params.ultimateCreditorStreet?.substring(0, 70) || '',
          params.ultimateCreditorBuildingNumber?.substring(0, 16) || '',
          params.ultimateCreditorPostalCode?.substring(0, 16) || '',
          params.ultimateCreditorCity?.substring(0, 35) || '',
        ]
      : [
          params.ultimateCreditorStreet?.substring(0, 70) || '',
          params.ultimateCreditorCity?.substring(0, 70) || '',
          '',
          '',
        ]),
    params.ultimateCreditorCountry?.toUpperCase() || ''
  );

  lines.push(
    params.amount !== undefined && params.amount > 0 ? params.amount.toFixed(2) : '',
    params.currency
  );

  lines.push(
    params.ultimateDebtorAddressType || '',
    params.ultimateDebtorName?.substring(0, 70) || '',
    ...(params.ultimateDebtorAddressType === 'S'
      ? [
          params.ultimateDebtorStreet?.substring(0, 70) || '',
          params.ultimateDebtorBuildingNumber?.substring(0, 16) || '',
          params.ultimateDebtorPostalCode?.substring(0, 16) || '',
          params.ultimateDebtorCity?.substring(0, 35) || '',
        ]
      : [
          params.ultimateDebtorStreet?.substring(0, 70) || '',
          params.ultimateDebtorCity?.substring(0, 70) || '',
          '',
          '',
        ]),
    params.ultimateDebtorCountry?.toUpperCase() || ''
  );

  lines.push(
    params.referenceType,
    params.reference?.substring(0, 27) || '',
    params.unstructuredMessage?.substring(0, 140) || '',
    params.trailer || 'EPD',
    params.billInformation?.substring(0, 140) || ''
  );

  if (params.alternativeProcedure1) {
    lines.push(params.alternativeProcedure1.substring(0, 100));
  }
  if (params.alternativeProcedure2) {
    lines.push(params.alternativeProcedure2.substring(0, 100));
  }

  return lines.join('\n');
}

/**
 * Generate Lightning Network invoice URI (BOLT11)
 */
export function generateLightning(params: LightningParams): string {
  const invoice = params.invoice.toLowerCase().replace(/^lightning:/i, '');
  return `lightning:${invoice}`;
}

/**
 * Generate Ethereum transaction request URI (EIP-681)
 */
export function generateEthereumEIP681(params: EthereumEIP681Params): string {
  let uri = 'ethereum:';

  if (params.tokenAddress) {
    uri += params.tokenAddress;
    if (params.chainId && params.chainId !== 1) {
      uri += `@${params.chainId}`;
    }
    uri += '/transfer';

    const queryParams = new URLSearchParams();
    queryParams.set('address', params.targetAddress);
    if (params.tokenValue) {
      queryParams.set('uint256', params.tokenValue);
    }
    if (params.gas) queryParams.set('gas', params.gas.toString());
    if (params.gasLimit) queryParams.set('gasLimit', params.gasLimit.toString());
    if (params.gasPrice) queryParams.set('gasPrice', params.gasPrice);

    uri += `?${queryParams.toString()}`;
  } else {
    uri += params.targetAddress;

    if (params.chainId && params.chainId !== 1) {
      uri += `@${params.chainId}`;
    }

    if (params.functionName) {
      uri += `/${params.functionName}`;
    }

    const queryParams = new URLSearchParams();
    if (params.value) queryParams.set('value', params.value);
    if (params.gas) queryParams.set('gas', params.gas.toString());
    if (params.gasLimit) queryParams.set('gasLimit', params.gasLimit.toString());
    if (params.gasPrice) queryParams.set('gasPrice', params.gasPrice);

    if (params.functionParams) {
      for (const [key, value] of Object.entries(params.functionParams)) {
        queryParams.set(key, value);
      }
    }

    const paramStr = queryParams.toString();
    if (paramStr) {
      uri += `?${paramStr}`;
    }
  }

  return uri;
}

/**
 * Generate cryptocurrency payment URI (BIP-21 for Bitcoin, etc.)
 */
export function generateCrypto(params: CryptoHelper): string {
  const scheme = params.type.toLowerCase();
  let uri = `${scheme}:${params.address}`;

  const queryParams = new URLSearchParams();
  if (params.amount !== undefined && params.amount > 0) {
    queryParams.set('amount', params.amount.toString());
  }
  if (params.label) {
    queryParams.set('label', params.label);
  }

  const paramStr = queryParams.toString();
  if (paramStr) {
    uri += `?${paramStr}`;
  }

  return uri;
}

/**
 * Generate PayPal.Me payment link
 */
export function generatePayPalMe(params: PayPalMeParams): string {
  let url = `https://paypal.me/${params.username}`;

  if (params.amount !== undefined && params.amount > 0) {
    url += `/${params.amount.toFixed(2)}`;
    if (params.currencyCode) {
      url += params.currencyCode.toUpperCase();
    }
  }

  return url;
}

/**
 * Generate Cash App ($cashtag) payment link
 */
export function generateCashApp(params: CashAppParams): string {
  const cashtag = params.cashtag.replace(/^\$/, '');
  let url = `https://cash.app/$${cashtag}`;

  if (params.amount !== undefined && params.amount > 0) {
    url += `/${params.amount.toFixed(2)}`;
  }

  return url;
}

// ============================================
// NATIONAL EMV PAYMENT SCHEME GENERATORS
// ============================================

/**
 * Generate QRIS QR code (Indonesia)
 */
export function generateQRIS(params: QRISParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: params.merchantID }];
  if (params.merchantCriteria) {
    maiData.push({ tag: '02', value: params.merchantCriteria });
  }
  if (params.nmid) {
    maiData.push({ tag: '03', value: params.nmid });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.QRIS, maiData);

  if (params.merchantPAN) {
    builder.addMerchantAccountInfo(51, 'ID.CO.QRIS.WWW', [
      { tag: '01', value: params.merchantPAN },
    ]);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.IDR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.IDR);
  }

  if (params.feeType === 'FIXED' && params.feeAmount) {
    builder.setTipIndicator('02', params.feeAmount);
  } else if (params.feeType === 'PERCENT' && params.feeAmount) {
    builder.setTipIndicator('03', params.feeAmount);
  }

  builder.setCountryCode('ID');
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  if (params.terminalLabel) {
    builder.setAdditionalData({ terminalLabel: params.terminalLabel });
  }

  return builder.build();
}

/**
 * Generate DuitNow QR code (Malaysia)
 */
export function generateDuitNow(params: DuitNowParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const proxyTypeMap: Record<string, string> = {
    NRIC: '01',
    MOBILE: '02',
    PASSPORT: '03',
    ARMY: '04',
    BUSINESS: '05',
    OTHERS: '99',
  };

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: '01', value: proxyTypeMap[params.proxyType] },
    { tag: '02', value: params.proxyValue },
  ];

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.DUITNOW, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.MYR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('MY');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}

/**
 * Generate BharatQR code (India)
 */
export function generateBharatQR(params: BharatQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];

  if (params.merchantVPA) {
    maiData.push({ tag: '01', value: params.merchantVPA });
  }
  if (params.merchantPAN) {
    maiData.push({ tag: '02', value: params.merchantPAN });
  }
  if (params.merchantID) {
    maiData.push({ tag: '03', value: params.merchantID });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.BHARATQR, maiData);

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.INR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('IN');
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  const additionalData: Record<string, string> = {};
  if (params.referenceNumber) additionalData.referenceLabel = params.referenceNumber;
  if (params.terminalId) additionalData.terminalLabel = params.terminalId;
  if (Object.keys(additionalData).length > 0) {
    builder.setAdditionalData(additionalData);
  }

  return builder.build();
}

/**
 * Generate VietQR code (Vietnam)
 */
export function generateVietQR(params: VietQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: '01', value: params.bankBin },
    { tag: '02', value: params.accountNumber },
  ];
  if (params.serviceCode) {
    maiData.push({ tag: '03', value: params.serviceCode });
  }

  builder.addMerchantAccountInfo(38, PAYMENT_SCHEME_GUI.VIETQR, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.VND);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.VND);
  }

  builder.setCountryCode('VN');

  if (params.accountName) {
    builder.setMerchantName(params.accountName);
  }

  if (params.description) {
    builder.setAdditionalData({ purposeOfTransaction: params.description });
  }

  return builder.build();
}

/**
 * Generate QR Ph code (Philippines)
 */
export function generateQRPh(params: QRPhParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.QRPH, [
    { tag: '01', value: params.accountNumber },
  ]);

  builder.setTransactionCurrency(ISO_CURRENCY.PHP);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('PH');
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}

/**
 * Generate TWQR code (Taiwan)
 */
export function generateTWQR(params: TWQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: params.merchantId }];
  if (params.taxId) {
    maiData.push({ tag: '02', value: params.taxId });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.TWQR, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.TWD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.TWD);
  }

  builder.setCountryCode('TW');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}

/**
 * Generate HKQR / FPS QR code (Hong Kong)
 */
export function generateHKQR(params: HKQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];
  if (params.fpsId) {
    maiData.push({ tag: '01', value: params.fpsId });
  }
  if (params.mobileNumber) {
    maiData.push({ tag: '02', value: params.mobileNumber });
  }
  if (params.email) {
    maiData.push({ tag: '03', value: params.email });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.HKFPS, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.HKD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('HK');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}

/**
 * Generate JPQR code (Japan)
 */
export function generateJPQR(params: JPQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.JPQR, [
    { tag: '01', value: params.storeId },
  ]);

  builder.setTransactionCurrency(ISO_CURRENCY.JPY);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.JPY);
  }

  builder.setCountryCode('JP');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}

/**
 * Generate AusPayNet/NPP PayID QR code (Australia)
 */
export function generateAusPayNet(params: AusPayNetParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];

  if (params.payId && params.payIdType) {
    maiData.push({ tag: '01', value: params.payIdType }, { tag: '02', value: params.payId });
  }

  if (params.bsb && params.accountNumber) {
    maiData.push({ tag: '03', value: params.bsb }, { tag: '04', value: params.accountNumber });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.AUSPAYNET, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.AUD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('AU');

  if (params.merchantName) {
    builder.setMerchantName(params.merchantName);
  }

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}

function resolveTipValue(params: EMVMPMParams): number | undefined {
  if (params.tipIndicator === '02') return params.tipFixed;
  if (params.tipIndicator === '03') return params.tipPercentage;
  return undefined;
}

function buildEMVAdditionalData(params: EMVMPMParams): Record<string, string> {
  const data: Record<string, string> = {};
  if (params.billNumber) data.billNumber = params.billNumber;
  if (params.mobileNumber) data.mobileNumber = params.mobileNumber;
  if (params.storeLabel) data.storeLabel = params.storeLabel;
  if (params.loyaltyNumber) data.loyaltyNumber = params.loyaltyNumber;
  if (params.referenceLabel) data.referenceLabel = params.referenceLabel;
  if (params.customerLabel) data.customerLabel = params.customerLabel;
  if (params.terminalLabel) data.terminalLabel = params.terminalLabel;
  if (params.purposeOfTransaction) data.purposeOfTransaction = params.purposeOfTransaction;
  return data;
}

/**
 * Generate a generic EMV MPM QR code
 */
export function generateEMVMPM(params: EMVMPMParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(params.isStatic ?? true);

  if (params.merchantAccounts) {
    for (const account of params.merchantAccounts) {
      builder.addMerchantAccountInfo(account.tag, account.gui, account.data);
    }
  }

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(params.currencyCode);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, params.currencyCode);
  }

  if (params.tipIndicator) {
    builder.setTipIndicator(params.tipIndicator, resolveTipValue(params));
  }

  builder.setCountryCode(params.countryCode);
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  const additionalData = buildEMVAdditionalData(params);
  if (Object.keys(additionalData).length > 0) {
    builder.setAdditionalData(additionalData);
  }

  return builder.build();
}
