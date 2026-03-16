import { MemoCache } from "./memo-cache";
import type { OverlayDataMatrix } from "./cache.types";

export const overlayDataCache = new MemoCache<OverlayDataMatrix>(20);
