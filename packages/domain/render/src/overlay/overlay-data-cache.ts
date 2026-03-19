import { MemoCache, type OverlayDataMatrix } from "@/domain/qr/cache";

export const overlayDataCache = new MemoCache<OverlayDataMatrix>(20);
