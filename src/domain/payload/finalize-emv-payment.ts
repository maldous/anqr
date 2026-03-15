import { EMVQRBuilder } from './emv';

export function finalizeEmvPayment(
  builder: EMVQRBuilder,
  params: Readonly<{
    amount?: number;
    countryCode: string;
    currency: string;
    merchantCity?: string;
    merchantName?: string;
    reference?: string;
  }>
): string {
  builder.setTransactionCurrency(params.currency);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode(params.countryCode);

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
