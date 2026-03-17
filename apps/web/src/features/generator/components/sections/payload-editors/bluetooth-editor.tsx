import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import type { QRState } from "@/store/qr-store";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

export const BluetoothEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadText: QRState["setPayloadText"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.deviceAddress")}</HighlightedLabel>
        </Label>
        <Input
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder="00:11:22:33:44:55"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.deviceName")}</HighlightedLabel>
        </Label>
        <Input placeholder="My Bluetooth Device" />
      </div>
      <p className="text-xs text-muted-foreground">{t("hints.bluetoothNote")}</p>
    </div>
  );
};
