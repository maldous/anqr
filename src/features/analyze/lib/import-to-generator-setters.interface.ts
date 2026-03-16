export interface ImportToGeneratorSetters {
  setPayloadText: (v: string) => void;
  setPayloadKind: (v: "url" | "plain_text") => void;
  setPayloadUrl: (v: { href: string }) => void;
  setQrEcc: (v: "L" | "M" | "Q" | "H") => void;
  setQrVersion: (v: number) => void;
  setQrMaskPattern: (v: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  setQrEncodingMode: (v: "auto" | "numeric" | "alphanumeric" | "byte" | "kanji") => void;
  setRenderFgColor: (v: string) => void;
  setRenderBgColor: (v: string) => void;
}
