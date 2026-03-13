export interface SwissQRBillForm {
  creditorIBAN: string;
  creditorName: string;
  creditorCity: string;
  creditorCountry: string;
  referenceType: 'QRR' | 'SCOR' | 'NON';
  reference: string;
  amount: string;
  currency: 'CHF' | 'EUR';
}
