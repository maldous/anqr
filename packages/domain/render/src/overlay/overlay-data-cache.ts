import { MemoCache } from "../../../qr/src/qr-generator/memo-cache";
import type { OverlayDataMatrix } from "../../../qr/src/qr-generator/cache.types";

export const overlayDataCache = new MemoCache<OverlayDataMatrix>(20);
