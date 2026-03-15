export interface EMVMerchantAccount {
  tag: number;
  gui: string;
  data: Array<{ tag: string; value: string }>;
}
