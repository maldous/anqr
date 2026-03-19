import type { MaskPattern as BaseMaskPattern } from "@/contracts/generator";

export type MaskPattern = Exclude<BaseMaskPattern, "auto"> | -1;
