import type { QRState } from "../qr-store";

export const DEFAULT_WATERMARK: QRState["watermark"] = {
  enabled: false,
  kind: "text",
  text: "",
  image: null,
  position: "center",
  opacity: 50,
  blend: "normal",
};
