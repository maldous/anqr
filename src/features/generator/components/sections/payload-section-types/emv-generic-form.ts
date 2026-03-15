export interface EMVGenericForm {
  merchantName: string;
  merchantCity: string;
  countryCode: string;
  currencyCode: string;
  amount: string;
  mcc: string;
  postalCode: string;
  tipIndicator: 'none' | 'prompt' | 'fixed' | 'percent';
  tipAmount: string;
  tipPercent: string;
  reference: string;
  storeLabel: string;
  terminalLabel: string;
}
