import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ======================== EMV QR BUILDER ========================

describe('EMVQRBuilder', () => {
  describe('encodeTLV', () => {
    it('encodes a simple tag-length-value', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const result = EMVQRBuilder.encodeTLV('00', '01');
      expect(result).toBe('000201');
    });

    it('pads tag to 2 digits', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const result = EMVQRBuilder.encodeTLV('1', 'AB');
      expect(result).toBe('0102AB');
    });

    it('returns empty string for empty value', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      expect(EMVQRBuilder.encodeTLV('00', '')).toBe('');
    });

    it('throws for value > 99 bytes', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const longValue = 'A'.repeat(100);
      expect(() => EMVQRBuilder.encodeTLV('00', longValue)).toThrow('exceeds 99 bytes');
    });
  });

  describe('buildTemplate', () => {
    it('concatenates TLV fields', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const result = EMVQRBuilder.buildTemplate([
        { tag: '00', value: 'AB' },
        { tag: '01', value: 'CD' },
      ]);
      expect(result).toBe('0002AB0102CD');
    });

    it('filters out empty values', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const result = EMVQRBuilder.buildTemplate([
        { tag: '00', value: 'AB' },
        { tag: '01', value: '' },
      ]);
      expect(result).toBe('0002AB');
    });
  });

  describe('full builder chain', () => {
    it('creates a basic EMV QR code with CRC', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setPointOfInitiation(true)
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('NYC')
        .build();
      expect(qr).toContain('000201');
      expect(qr).toContain('010211');
      expect(qr).toContain('5303840');
      expect(qr).toContain('5802US');
      expect(qr).toContain('5904Test');
      expect(qr).toContain('6003NYC');
      expect(qr).toMatch(/6304[A-F0-9]{4}$/);
    });

    it('uses dynamic point of initiation', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setPointOfInitiation(false)
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('010212');
    });

    it('adds merchant account info', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .addMerchantAccountInfo(26, 'com.example', [{ tag: '01', value: 'DATA' }])
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('26');
      expect(qr).toContain('com.example');
    });

    it('throws for invalid merchant account tag', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      expect(() => {
        EMVQRBuilder.create().addMerchantAccountInfo(25, 'test', []);
      }).toThrow('26-51');
      expect(() => {
        EMVQRBuilder.create().addMerchantAccountInfo(52, 'test', []);
      }).toThrow('26-51');
    });

    it('sets transaction amount', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setTransactionAmount(12.50)
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('540512.50');
    });

    it('formats zero-decimal currencies as integers', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('392')
        .setTransactionAmount(1000, '392')
        .setCountryCode('JP')
        .setMerchantName('Test')
        .setMerchantCity('Tokyo')
        .build();
      expect(qr).toContain('54041000');
    });

    it('sets tip indicator with fixed value', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setTipIndicator('02', 5.00)
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('550202');
      expect(qr).toContain('5604');
    });

    it('sets tip indicator with percentage', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setTipIndicator('03', 10)
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('550203');
      expect(qr).toContain('5702');
    });

    it('sets tip indicator 01 (user prompt)', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setTipIndicator('01')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('550201');
    });

    it('sets MCC', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setMCC('5411')
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).toContain('52045411');
    });

    it('ignores invalid MCC', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setMCC('12')
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).not.toContain('520212');
    });

    it('sets postal code', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .setPostalCode('12345')
        .build();
      expect(qr).toContain('610512345');
    });

    it('sets additional data fields', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .setAdditionalData({
          billNumber: 'BILL1',
          mobileNumber: '+123',
          storeLabel: 'S1',
          loyaltyNumber: 'L1',
          referenceLabel: 'REF1',
          customerLabel: 'C1',
          terminalLabel: 'T1',
          purposeOfTransaction: 'Pay',
          additionalConsumerData: 'ME',
        })
        .build();
      expect(qr).toContain('62');
    });

    it('setField adds arbitrary field', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .setField('80', 'CustomData')
        .build();
      expect(qr).toContain('8010CustomData');
    });

    it('does not set amount for zero or negative amounts', async () => {
      const { EMVQRBuilder } = await import('../../src/modules/payload-generators/emv');
      const qr = EMVQRBuilder.create()
        .setPayloadFormatIndicator()
        .setTransactionCurrency('840')
        .setTransactionAmount(0)
        .setCountryCode('US')
        .setMerchantName('Test')
        .setMerchantCity('City')
        .build();
      expect(qr).not.toContain('5400');
    });
  });
});

describe('parseEMVQR', () => {
  it('parses a valid EMV string', async () => {
    const { EMVQRBuilder, parseEMVQR } = await import('../../src/modules/payload-generators/emv');
    const qr = EMVQRBuilder.create()
      .setPayloadFormatIndicator()
      .setPointOfInitiation(true)
      .setTransactionCurrency('840')
      .setCountryCode('US')
      .setMerchantName('Test')
      .setMerchantCity('City')
      .build();
    const fields = parseEMVQR(qr);
    expect(fields.get('00')).toBe('01');
    expect(fields.get('01')).toBe('11');
    expect(fields.get('53')).toBe('840');
    expect(fields.get('58')).toBe('US');
    expect(fields.get('59')).toBe('Test');
    expect(fields.get('60')).toBe('City');
  });

  it('handles malformed input gracefully', async () => {
    const { parseEMVQR } = await import('../../src/modules/payload-generators/emv');
    const fields = parseEMVQR('00XX');
    expect(fields.size).toBe(0);
  });
});

describe('validateEMVQRCRC', () => {
  it('validates correct CRC', async () => {
    const { EMVQRBuilder, validateEMVQRCRC } = await import('../../src/modules/payload-generators/emv');
    const qr = EMVQRBuilder.create()
      .setPayloadFormatIndicator()
      .setTransactionCurrency('840')
      .setCountryCode('US')
      .setMerchantName('Test')
      .setMerchantCity('City')
      .build();
    expect(validateEMVQRCRC(qr)).toBe(true);
  });

  it('rejects tampered CRC', async () => {
    const { EMVQRBuilder, validateEMVQRCRC } = await import('../../src/modules/payload-generators/emv');
    const qr = EMVQRBuilder.create()
      .setPayloadFormatIndicator()
      .setTransactionCurrency('840')
      .setCountryCode('US')
      .setMerchantName('Test')
      .setMerchantCity('City')
      .build();
    const tampered = qr.substring(0, qr.length - 4) + '0000';
    expect(validateEMVQRCRC(tampered)).toBe(false);
  });

  it('rejects too-short payload', async () => {
    const { validateEMVQRCRC } = await import('../../src/modules/payload-generators/emv');
    expect(validateEMVQRCRC('short')).toBe(false);
  });
});

// ======================== PAYMENT GENERATORS ========================

describe('payment generators', () => {
  describe('generateEPCSepa', () => {
    it('generates basic EPC string', async () => {
      const { generateEPCSepa } = await import('../../src/modules/payload-generators/payments');
      const result = generateEPCSepa({
        name: 'John Doe',
        iban: 'DE89 3704 0044 0532 0130 00',
        amount: 100.50,
      });
      expect(result).toContain('BCD');
      expect(result).toContain('SCT');
      expect(result).toContain('John Doe');
      expect(result).toContain('DE89370400440532013000');
      expect(result).toContain('EUR100.50');
    });

    it('handles missing amount', async () => {
      const { generateEPCSepa } = await import('../../src/modules/payload-generators/payments');
      const result = generateEPCSepa({
        name: 'Jane',
        iban: 'DE12345',
      });
      expect(result).toContain('BCD');
      expect(result).not.toContain('EUR');
    });

    it('includes BIC and reference', async () => {
      const { generateEPCSepa } = await import('../../src/modules/payload-generators/payments');
      const result = generateEPCSepa({
        name: 'Test',
        iban: 'DE12345',
        bic: 'COBADEFFXXX',
        reference: 'REF123',
        text: 'Payment for invoice',
        amount: 50,
      });
      expect(result).toContain('COBADEFFXXX');
      expect(result).toContain('REF123');
      expect(result).toContain('Payment for invoice');
    });
  });

  describe('generateUPI', () => {
    it('generates basic UPI URI', async () => {
      const { generateUPI } = await import('../../src/modules/payload-generators/payments');
      const result = generateUPI({ pa: 'user@upi' });
      expect(result).toBe('upi://pay?pa=user%40upi&cu=INR');
    });

    it('includes all optional params', async () => {
      const { generateUPI } = await import('../../src/modules/payload-generators/payments');
      const result = generateUPI({
        pa: 'user@upi',
        pn: 'User Name',
        am: 100,
        cu: 'INR',
        tn: 'Test note',
        tr: 'TXN123',
        mc: '5411',
        tid: 'T001',
        url: 'https://example.com',
        mode: '02',
        purpose: 'pay',
        orgid: 'ORG1',
        sign: 'SIG',
      });
      expect(result).toContain('pn=');
      expect(result).toContain('am=100.00');
      expect(result).toContain('tn=');
      expect(result).toContain('mc=5411');
    });
  });

  describe('generatePayNow', () => {
    it('generates mobile PayNow', async () => {
      const { generatePayNow } = await import('../../src/modules/payload-generators/payments');
      const result = generatePayNow({
        type: 'mobile',
        value: '+6591234567',
        editable: true,
      });
      expect(result).toContain('000201');
      expect(result).toMatch(/6304[A-F0-9]{4}$/);
    });

    it('generates UEN PayNow with amount', async () => {
      const { generatePayNow } = await import('../../src/modules/payload-generators/payments');
      const result = generatePayNow({
        type: 'uen',
        value: '201234567A',
        editable: false,
        amount: 50,
        merchantName: 'Shop',
        merchantCity: 'Singapore',
        reference: 'INV001',
      });
      expect(result).toContain('Shop');
    });

    it('generates NRIC PayNow with expiry', async () => {
      const { generatePayNow } = await import('../../src/modules/payload-generators/payments');
      const result = generatePayNow({
        type: 'nric',
        value: 'S1234567A',
        editable: false,
        expiryDate: '20251231',
      });
      expect(result).toContain('20251231');
    });
  });

  describe('generatePromptPay', () => {
    it('generates mobile PromptPay', async () => {
      const { generatePromptPay } = await import('../../src/modules/payload-generators/payments');
      const result = generatePromptPay({
        type: 'mobile',
        value: '0812345678',
      });
      expect(result).toContain('000201');
      expect(result).toContain('66812345678');
    });

    it('generates ID PromptPay with amount', async () => {
      const { generatePromptPay } = await import('../../src/modules/payload-generators/payments');
      const result = generatePromptPay({
        type: 'id',
        value: '1234567890123',
        amount: 100,
        merchantName: 'Shop',
        merchantCity: 'Bangkok',
        countryCode: 'TH',
        mcc: '5411',
      });
      expect(result).toContain('Shop');
    });

    it('generates billpay PromptPay with refs', async () => {
      const { generatePromptPay } = await import('../../src/modules/payload-generators/payments');
      const result = generatePromptPay({
        type: 'billpay',
        value: '1234567890',
        ref1: 'REF1',
        ref2: 'REF2',
        ref3: 'REF3',
      });
      expect(result).toContain('REF1');
    });

    it('generates ewallet PromptPay', async () => {
      const { generatePromptPay } = await import('../../src/modules/payload-generators/payments');
      const result = generatePromptPay({
        type: 'ewallet',
        value: '1234567890',
      });
      expect(result).toContain('000201');
    });
  });

  describe('generatePIX', () => {
    it('generates basic PIX', async () => {
      const { generatePIX } = await import('../../src/modules/payload-generators/payments');
      const result = generatePIX({
        key: 'user@email.com',
      });
      expect(result).toContain('000201');
      expect(result).toContain('user@email.com');
    });

    it('generates PIX with all params', async () => {
      const { generatePIX } = await import('../../src/modules/payload-generators/payments');
      const result = generatePIX({
        key: '+5511999999999',
        amount: 25.50,
        name: 'Merchant',
        city: 'Sao Paulo',
        postalCode: '01310-100',
        txid: 'TX123',
        description: 'Payment',
        url: 'https://pix.example.com',
      });
      expect(result).toContain('Merchant');
    });
  });

  describe('generateSwissQRBill', () => {
    it('generates with S address type', async () => {
      const { generateSwissQRBill } = await import('../../src/modules/payload-generators/payments');
      const result = generateSwissQRBill({
        creditorIBAN: 'CH93 0076 2011 6238 5295 7',
        creditorAddressType: 'S',
        creditorName: 'John Doe',
        creditorStreet: 'Main St',
        creditorBuildingNumber: '1',
        creditorPostalCode: '8001',
        creditorCity: 'Zurich',
        creditorCountry: 'CH',
        amount: 100,
        currency: 'CHF',
        referenceType: 'QRR',
        reference: '210000000003139471430009017',
      });
      expect(result).toContain('SPC');
      expect(result).toContain('John Doe');
      expect(result).toContain('CH9300762011623852957');
      expect(result).toContain('CHF');
    });

    it('generates with K (combined) address type', async () => {
      const { generateSwissQRBill } = await import('../../src/modules/payload-generators/payments');
      const result = generateSwissQRBill({
        creditorIBAN: 'CH1234',
        creditorAddressType: 'K',
        creditorName: 'Jane',
        creditorStreet: 'Street 1',
        creditorCity: '8001 Zurich',
        creditorCountry: 'CH',
        currency: 'EUR',
        referenceType: 'NON',
      });
      expect(result).toContain('SPC');
      expect(result).toContain('Jane');
    });

    it('includes ultimate creditor', async () => {
      const { generateSwissQRBill } = await import('../../src/modules/payload-generators/payments');
      const result = generateSwissQRBill({
        creditorIBAN: 'CH1234',
        creditorAddressType: 'S',
        creditorName: 'Creditor',
        creditorCountry: 'CH',
        currency: 'CHF',
        referenceType: 'NON',
        ultimateCreditorAddressType: 'S',
        ultimateCreditorName: 'UltCreditor',
        ultimateCreditorStreet: 'St',
        ultimateCreditorCity: 'Bern',
        ultimateCreditorCountry: 'CH',
      });
      expect(result).toContain('UltCreditor');
    });

    it('includes debtor and alternative procedures', async () => {
      const { generateSwissQRBill } = await import('../../src/modules/payload-generators/payments');
      const result = generateSwissQRBill({
        creditorIBAN: 'CH1234',
        creditorAddressType: 'S',
        creditorName: 'Creditor',
        creditorCountry: 'CH',
        currency: 'CHF',
        referenceType: 'NON',
        ultimateDebtorAddressType: 'S',
        ultimateDebtorName: 'Debtor',
        ultimateDebtorStreet: 'Debtor St',
        ultimateDebtorCity: 'Bern',
        ultimateDebtorCountry: 'CH',
        alternativeProcedure1: 'AP1-DATA',
        alternativeProcedure2: 'AP2-DATA',
        unstructuredMessage: 'For invoice 123',
        billInformation: 'BILL-INFO',
        trailer: 'EPD',
      });
      expect(result).toContain('Debtor');
      expect(result).toContain('AP1-DATA');
      expect(result).toContain('AP2-DATA');
    });
  });

  describe('generateLightning', () => {
    it('generates lightning URI', async () => {
      const { generateLightning } = await import('../../src/modules/payload-generators/payments');
      const result = generateLightning({ invoice: 'lnbc1pvjluezpp5qqqsyq' });
      expect(result).toBe('lightning:lnbc1pvjluezpp5qqqsyq');
    });

    it('strips existing lightning: prefix', async () => {
      const { generateLightning } = await import('../../src/modules/payload-generators/payments');
      const result = generateLightning({ invoice: 'LIGHTNING:LNBC1PV' });
      expect(result).toBe('lightning:lnbc1pv');
    });
  });

  describe('generateEthereumEIP681', () => {
    it('generates basic ETH transfer', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0x1234567890abcdef',
        value: '1000000000000000000',
      });
      expect(result).toContain('ethereum:0x1234567890abcdef');
      expect(result).toContain('value=');
    });

    it('generates token transfer', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0xRecipient',
        tokenAddress: '0xToken',
        tokenValue: '1000',
        chainId: 1,
      });
      expect(result).toContain('ethereum:0xToken/transfer');
      expect(result).toContain('address=0xRecipient');
      expect(result).toContain('uint256=1000');
    });

    it('includes chainId for non-mainnet', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0xAddr',
        chainId: 137,
      });
      expect(result).toContain('@137');
    });

    it('includes gas parameters', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0xAddr',
        gas: 21000,
        gasLimit: 100000,
        gasPrice: '20000000000',
      });
      expect(result).toContain('gas=21000');
      expect(result).toContain('gasLimit=100000');
      expect(result).toContain('gasPrice=20000000000');
    });

    it('includes function name and params', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0xContract',
        functionName: 'approve',
        functionParams: { spender: '0xSpender', amount: '1000' },
      });
      expect(result).toContain('/approve');
      expect(result).toContain('spender=0xSpender');
      expect(result).toContain('amount=1000');
    });

    it('token transfer with chainId and gas', async () => {
      const { generateEthereumEIP681 } = await import('../../src/modules/payload-generators/payments');
      const result = generateEthereumEIP681({
        targetAddress: '0xRecipient',
        tokenAddress: '0xToken',
        chainId: 56,
        gas: 60000,
      });
      expect(result).toContain('0xToken@56/transfer');
      expect(result).toContain('gas=60000');
    });
  });

  describe('generateCrypto', () => {
    it('generates bitcoin URI', async () => {
      const { generateCrypto } = await import('../../src/modules/payload-generators/payments');
      const result = generateCrypto({ type: 'bitcoin', address: '1A1zP1' });
      expect(result).toBe('bitcoin:1A1zP1');
    });

    it('includes amount and label', async () => {
      const { generateCrypto } = await import('../../src/modules/payload-generators/payments');
      const result = generateCrypto({ type: 'Bitcoin', address: '1A1zP1', amount: 0.5, label: 'Donation' });
      expect(result).toContain('amount=0.5');
      expect(result).toContain('label=Donation');
    });
  });

  describe('generatePayPalMe', () => {
    it('generates basic PayPal.me link', async () => {
      const { generatePayPalMe } = await import('../../src/modules/payload-generators/payments');
      expect(generatePayPalMe({ username: 'john' })).toBe('https://paypal.me/john');
    });

    it('includes amount and currency', async () => {
      const { generatePayPalMe } = await import('../../src/modules/payload-generators/payments');
      const result = generatePayPalMe({ username: 'john', amount: 25.50, currencyCode: 'USD' });
      expect(result).toBe('https://paypal.me/john/25.50USD');
    });
  });

  describe('generateCashApp', () => {
    it('generates basic Cash App link', async () => {
      const { generateCashApp } = await import('../../src/modules/payload-generators/payments');
      expect(generateCashApp({ cashtag: '$john' })).toBe('https://cash.app/$john');
    });

    it('includes amount', async () => {
      const { generateCashApp } = await import('../../src/modules/payload-generators/payments');
      expect(generateCashApp({ cashtag: 'john', amount: 10 })).toBe('https://cash.app/$john/10.00');
    });
  });

  describe('national EMV payment schemes', () => {
    it('generateQRIS creates valid QRIS', async () => {
      const { generateQRIS } = await import('../../src/modules/payload-generators/payments');
      const result = generateQRIS({
        merchantID: 'M001',
        merchantName: 'Toko',
        merchantCity: 'Jakarta',
        amount: 50000,
        merchantCriteria: 'UMI',
        nmid: 'NMID001',
        merchantPAN: 'PAN123',
        feeType: 'FIXED',
        feeAmount: 500,
        postalCode: '12345',
        terminalLabel: 'T1',
      });
      expect(result).toContain('000201');
      expect(result).toContain('Toko');
    });

    it('generateQRIS with percent fee', async () => {
      const { generateQRIS } = await import('../../src/modules/payload-generators/payments');
      const result = generateQRIS({
        merchantID: 'M001',
        merchantName: 'Shop',
        merchantCity: 'Jakarta',
        feeType: 'PERCENT',
        feeAmount: 5,
      });
      expect(result).toContain('000201');
    });

    it('generateDuitNow creates valid QR', async () => {
      const { generateDuitNow } = await import('../../src/modules/payload-generators/payments');
      const result = generateDuitNow({
        proxyType: 'MOBILE',
        proxyValue: '+60123456789',
        merchantName: 'Shop',
        amount: 50,
        merchantCity: 'KL',
        reference: 'REF1',
      });
      expect(result).toContain('000201');
      expect(result).toContain('Shop');
    });

    it('generateBharatQR creates valid QR', async () => {
      const { generateBharatQR } = await import('../../src/modules/payload-generators/payments');
      const result = generateBharatQR({
        merchantName: 'Shop',
        merchantCity: 'Mumbai',
        merchantVPA: 'merchant@upi',
        merchantPAN: 'PAN123',
        merchantID: 'MID001',
        mcc: '5411',
        amount: 100,
        referenceNumber: 'REF1',
        terminalId: 'T1',
      });
      expect(result).toContain('Shop');
    });

    it('generateVietQR creates valid QR', async () => {
      const { generateVietQR } = await import('../../src/modules/payload-generators/payments');
      const result = generateVietQR({
        bankBin: '970436',
        accountNumber: '1234567890',
        amount: 100000,
        accountName: 'Nguyen Van',
        description: 'Payment',
        serviceCode: 'QRIBFTTA',
      });
      expect(result).toContain('000201');
    });

    it('generateQRPh creates valid QR', async () => {
      const { generateQRPh } = await import('../../src/modules/payload-generators/payments');
      const result = generateQRPh({
        accountNumber: '1234567890',
        merchantName: 'Store',
        merchantCity: 'Manila',
        amount: 500,
        reference: 'REF1',
      });
      expect(result).toContain('Store');
    });

    it('generateTWQR creates valid QR', async () => {
      const { generateTWQR } = await import('../../src/modules/payload-generators/payments');
      const result = generateTWQR({
        merchantId: 'TW001',
        merchantName: 'Shop',
        amount: 500,
        merchantCity: 'Taipei',
        taxId: 'TAX001',
      });
      expect(result).toContain('000201');
    });

    it('generateHKQR creates valid QR', async () => {
      const { generateHKQR } = await import('../../src/modules/payload-generators/payments');
      const result = generateHKQR({
        merchantName: 'HK Shop',
        fpsId: 'FPS001',
        mobileNumber: '+85212345678',
        email: 'test@hk.com',
        amount: 100,
        merchantCity: 'HK',
        reference: 'REF1',
      });
      expect(result).toContain('HK Shop');
    });

    it('generateJPQR creates valid QR', async () => {
      const { generateJPQR } = await import('../../src/modules/payload-generators/payments');
      const result = generateJPQR({
        storeId: 'JP001',
        merchantName: 'Konbini',
        amount: 1000,
        merchantCity: 'Tokyo',
      });
      expect(result).toContain('Konbini');
    });

    it('generateAusPayNet creates valid QR with PayID', async () => {
      const { generateAusPayNet } = await import('../../src/modules/payload-generators/payments');
      const result = generateAusPayNet({
        payIdType: 'EMAIL',
        payId: 'user@example.com',
        merchantName: 'AU Shop',
        amount: 50,
        merchantCity: 'Sydney',
        reference: 'REF1',
      });
      expect(result).toContain('AU Shop');
    });

    it('generateAusPayNet creates valid QR with BSB', async () => {
      const { generateAusPayNet } = await import('../../src/modules/payload-generators/payments');
      const result = generateAusPayNet({
        bsb: '062000',
        accountNumber: '12345678',
        merchantName: 'AU Shop',
      });
      expect(result).toContain('000201');
    });

    it('generateEMVMPM creates generic EMV QR', async () => {
      const { generateEMVMPM } = await import('../../src/modules/payload-generators/payments');
      const result = generateEMVMPM({
        merchantAccounts: [
          { tag: 26, gui: 'com.example', data: [{ tag: '01', value: 'DATA' }] },
        ],
        currencyCode: '840',
        countryCode: 'US',
        merchantName: 'Test',
        merchantCity: 'NYC',
        amount: 100,
        mcc: '5411',
        tipIndicator: '02',
        tipFixed: 5,
        postalCode: '10001',
        billNumber: 'B1',
        mobileNumber: '+1',
        storeLabel: 'S1',
        loyaltyNumber: 'L1',
        referenceLabel: 'R1',
        customerLabel: 'C1',
        terminalLabel: 'T1',
        purposeOfTransaction: 'Pay',
      });
      expect(result).toContain('000201');
      expect(result).toContain('Test');
    });

    it('generateEMVMPM with tip percentage', async () => {
      const { generateEMVMPM } = await import('../../src/modules/payload-generators/payments');
      const result = generateEMVMPM({
        currencyCode: '840',
        countryCode: 'US',
        merchantName: 'Test',
        merchantCity: 'NYC',
        tipIndicator: '03',
        tipPercentage: 10,
        isStatic: false,
      });
      expect(result).toContain('010212');
    });

    it('generateEMVMPM with tip indicator 01', async () => {
      const { generateEMVMPM } = await import('../../src/modules/payload-generators/payments');
      const result = generateEMVMPM({
        currencyCode: '840',
        countryCode: 'US',
        merchantName: 'Test',
        merchantCity: 'NYC',
        tipIndicator: '01',
      });
      expect(result).toContain('550201');
    });
  });
});
