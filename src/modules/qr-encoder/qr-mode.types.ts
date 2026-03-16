import type { QRMode } from "./qr-mode";

export type QRModeType = (typeof QRMode)[keyof typeof QRMode];
