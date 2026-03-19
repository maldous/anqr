import { Label, Textarea } from "@/ui/web";
import type { TFunction } from "i18next";
import type { QRState } from "../../../../../state/qr-store";
import { HighlightedLabel } from "../../../search/search-context";

export const CustomEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadText: QRState["setPayloadText"];
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.rawData")}</HighlightedLabel>
      </Label>
      <Textarea
        value={payload.text}
        onChange={(e) => setPayloadText(e.target.value)}
        placeholder={t("placeholders.rawQrData")}
        rows={6}
        className="font-mono text-sm"
      />
    </div>
    <p className="text-xs text-muted-foreground">{t("hints.customNote")}</p>
  </div>
);
