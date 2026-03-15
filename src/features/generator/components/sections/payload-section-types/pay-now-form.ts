export interface PayNowForm {
  type: 'mobile' | 'uen';
  value: string;
  amount: string;
  reference: string;
}
