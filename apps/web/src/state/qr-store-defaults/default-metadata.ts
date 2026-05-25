import type { QRState } from "../qr-store";

export const DEFAULT_METADATA: QRState["metadata"] = {
  title: "",
  author: "",
  copyright: "",
  license: "",
  description: "",
  creationTime: false,
  customKv: [],
};
