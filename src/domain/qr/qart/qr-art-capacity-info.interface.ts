import { type ECCLevel } from "./bit-mapping";

export interface QRArtCapacityInfo {
  version: number;
  ecc: ECCLevel;
  totalDataBits: number;
  protectedBits: number;
  controllableBits: number;
  controlPercentage: number;
  protectionMode: "header-only" | "full-content";
  breakdown: {
    headerBits: number;
    dataBits: number;
    terminatorBits: number;
    paddingBits: number;
  };
}
