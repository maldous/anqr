export interface VietQRHelper {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  serviceCode?: 'QRPUSH' | 'QRIBFTTA' | 'QRIBFTTC';
  amount?: number;
  description?: string;
}
