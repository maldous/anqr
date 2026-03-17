import { type useQRStore } from "../../state/qr-store";

export type StoreState = ReturnType<typeof useQRStore.getState>;
