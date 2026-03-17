import { MemoCache } from "./memo-cache";
import type { QRMatrixCacheEntry } from "./cache.types";

export const qrMatrixCache = new MemoCache<QRMatrixCacheEntry>(30);
