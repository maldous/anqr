import type { QRMaskPattern } from "./qr-mask-pattern.const";

export type QRMaskPatternType = (typeof QRMaskPattern)[keyof typeof QRMaskPattern];
