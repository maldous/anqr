import { type useQRStore } from "@/store/qr-store";

export type StoreState = ReturnType<typeof useQRStore.getState>;
