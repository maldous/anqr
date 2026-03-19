import type { QRState } from "@/store/qr-store";

export type UseQRStoreHook = <U>(selector: (state: QRState) => U) => U;
