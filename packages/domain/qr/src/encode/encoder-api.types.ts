export type { ECCLevel } from "../spec/ecc-level";
import type { ECCLevel } from "../spec/ecc-level";
import type { EncodingMode as BaseEncodingMode } from "../qr-spec/encoding-mode";
import type { MaskPattern as BaseMaskPattern } from "../qr-spec/mask-pattern";

export interface DataSegment {
  data: string;
  mode: "numeric" | "alphanumeric" | "byte" | "kanji";
}

export type EncodingMode = BaseEncodingMode | "mixed";
export type MaskPattern = Exclude<BaseMaskPattern, "auto"> | -1;

export interface QROptions {
  errorCorrectionLevel?: ECCLevel;
  version?: number;
  maskPattern?: MaskPattern;
  mode?: EncodingMode;
}

export interface QRMatrix {
  modules: boolean[][];
  size: number;
  version: number;
}

export interface QRInstance {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  make(maskPattern?: number): void;
  addData(data: string, mode?: string): void;
}
