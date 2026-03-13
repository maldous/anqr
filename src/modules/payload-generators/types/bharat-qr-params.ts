export interface BharatQRParams {
  merchantVPA?: string;
  merchantPAN?: string;
  merchantID?: string;
  merchantName: string;
  merchantCity: string;
  mcc?: string;
  amount?: number;
  gstDetails?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  terminalId?: string;
}
