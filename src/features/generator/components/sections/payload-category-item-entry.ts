import type { PayloadKind } from '@/store/qr-store';

export type PayloadItemEntry = readonly [value: PayloadKind, labelKey: string];
