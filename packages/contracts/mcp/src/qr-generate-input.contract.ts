export type QrGenerateInput = {
  readonly data: string;
  readonly size?: number;
  readonly errorCorrection?: "L" | "M" | "Q" | "H";
  readonly foreground?: string;
  readonly background?: string;
  readonly format?: "png" | "svg";
  readonly margin?: number;
};
