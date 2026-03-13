import type { EMVMerchantAccount } from './emv-merchant-account';

export interface EMVMPMParams {
  merchantName: string;
  merchantCity: string;
  countryCode: string;
  currencyCode: string;
  amount?: number;
  isStatic?: boolean;
  mcc?: string;
  postalCode?: string;
  tipIndicator?: '01' | '02' | '03';
  tipFixed?: number;
  tipPercentage?: number;
  billNumber?: string;
  mobileNumber?: string;
  storeLabel?: string;
  loyaltyNumber?: string;
  referenceLabel?: string;
  customerLabel?: string;
  terminalLabel?: string;
  purposeOfTransaction?: string;
  merchantAccounts?: EMVMerchantAccount[];
}
