export interface VietQRParams {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  serviceCode?: 'QRPUSH' | 'QRIBFTTA' | 'QRIBFTTC';
}
