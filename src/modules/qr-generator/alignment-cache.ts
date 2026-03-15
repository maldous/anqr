import { MemoCache } from './memo-cache';

// Global caches for expensive operations
export const alignmentCache = new MemoCache<Array<{ row: number; col: number }>>(50);
