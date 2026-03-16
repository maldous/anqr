import type { TFunction } from "i18next";
import type { QRState } from "@/store/qr-store";

export interface PayloadTextEditorProps {
  payload: QRState["payload"];
  setPayloadText: QRState["setPayloadText"];
  t: TFunction;
}
