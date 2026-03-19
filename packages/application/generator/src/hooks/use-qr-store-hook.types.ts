import type { QRGeneratorStoreState } from "./qr-store-contract.types";

export type UseQRStoreHook = <U>(selector: (state: QRGeneratorStoreState) => U) => U;
