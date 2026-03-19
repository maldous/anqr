import { MemoCache } from "../../../qr/src/qr-generator/memo-cache";

export const alignmentCache = new MemoCache<Array<{ row: number; col: number }>>(50);
