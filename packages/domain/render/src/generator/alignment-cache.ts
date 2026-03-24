import { MemoCache } from "../cache";

export const alignmentCache = new MemoCache<Array<{ row: number; col: number }>>(50);
