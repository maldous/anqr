import type { PayloadKind } from "@/store/qr-store";

export const GLOBAL_PAYMENT_METHODS: PayloadKind[] = [
  "crypto",
  "lightning",
  "ethereum_eip681",
  "paypal_me",
  "cashapp",
];
