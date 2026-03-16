import type { QRMaskPattern } from "./qr-mask-pattern";

export type QRMaskPatternType = (typeof QRMaskPattern)[keyof typeof QRMaskPattern];
