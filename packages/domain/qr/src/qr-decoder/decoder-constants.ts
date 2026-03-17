import type { ECCLevelChar } from "./ecc-level-char";

export const ECC_LEVEL_MAP: Record<number, ECCLevelChar> = {
  0: "M",
  1: "L",
  2: "H",
  3: "Q",
};

export const MODE_NUMERIC = 0b0001;
export const MODE_ALPHANUMERIC = 0b0010;
export const MODE_BYTE = 0b0100;
export const MODE_KANJI = 0b1000;
export const MODE_ECI = 0b0111;
export const MODE_TERMINATOR = 0b0000;
export const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
