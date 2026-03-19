import type { MaskPattern as BaseMaskPattern } from "@/domain/qr/spec";

export type MaskPattern = Exclude<BaseMaskPattern, "auto"> | -1;
