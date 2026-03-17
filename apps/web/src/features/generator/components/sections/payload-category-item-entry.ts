import type { PayloadKind } from "../../../../state/qr-store";

export type PayloadItemEntry = readonly [value: PayloadKind, labelKey: string];
