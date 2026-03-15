export interface DuitNowHelper {
  proxyType: 'NRIC' | 'MOBILE' | 'PASSPORT' | 'ARMY' | 'BUSINESS' | 'OTHERS';
  proxyValue: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}
