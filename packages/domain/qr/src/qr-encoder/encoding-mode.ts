import type { EncodingMode as BaseEncodingMode } from "@/domain/qr/spec";

export type EncodingMode = BaseEncodingMode | "mixed";
