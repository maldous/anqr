import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import type { QRState } from "../../../../../state/qr-store";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { Textarea } from "../../../../../../../../packages/ui/web/src/primitives/textarea";

export const PlainTextEditor = ({
  payload,
  setPayloadText,
  setShowStartupHighlight,
  showStartupHighlight,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadText: QRState["setPayloadText"];
  setShowStartupHighlight: (show: boolean) => void;
  showStartupHighlight: boolean;
  t: TFunction;
}>) => {
  return (
    <div className={`space-y-2 ${showStartupHighlight ? "p-1 -m-1" : ""}`}>
      <Label>
        <HighlightedLabel>{t("payload.text")}</HighlightedLabel>
      </Label>
      <Textarea
        value={payload.text}
        onChange={(e) => {
          setPayloadText(e.target.value);
          setShowStartupHighlight(false);
        }}
        onFocus={() => setShowStartupHighlight(false)}
        placeholder={t("placeholders.enterText")}
        rows={4}
        className={
          showStartupHighlight
            ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse"
            : ""
        }
        title={t("hints.enterTextContent")}
        data-testid={DynamicTestId.resolve("payload-text-textarea", "payload-text-textarea")}
      />
    </div>
  );
};
