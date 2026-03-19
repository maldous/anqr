import type { QRMode } from "./qr-mode.const";

export type QRModeType = (typeof QRMode)[keyof typeof QRMode];
