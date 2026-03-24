import { MemoCache, type OverlayDataMatrix } from "../cache";

export const overlayDataCache = new MemoCache<OverlayDataMatrix>(20);
