import type { SwissQRBillParams } from '../../modules/payload-generators/types';

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
