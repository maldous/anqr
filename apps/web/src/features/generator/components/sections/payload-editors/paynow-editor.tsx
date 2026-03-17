import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidPhone } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../packages/ui/web/src/primitives/select";
import type { PayNowForm } from "../payload-section-types";
import { OptionalAmountField } from "./optional-amount-field";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";

export const PaynowEditor = ({
  payNowForm,
  payload,
  setPayNowForm,
  t,
}: Readonly<{
  payNowForm: PayNowForm;
  payload: QRState["payload"];
  setPayNowForm: React.Dispatch<React.SetStateAction<PayNowForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.proxyType")}</HighlightedLabel>
      </Label>
      <Select
        value={payNowForm.type}
        onValueChange={(v) => setPayNowForm((prev) => ({ ...prev, type: v as "mobile" | "uen" }))}
      >
        <SelectTrigger
          data-testid={DynamicTestId.resolve(
            "payload-paynow-type-select",
            "payload-paynow-type-select",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uen">UEN (Business)</SelectItem>
          <SelectItem value="mobile">{t("payload.mobileNumber")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <ValidatedLabeledInputField
      label={t("payload.uenMobile")}
      value={payNowForm.value}
      onChange={(value) => setPayNowForm((prev) => ({ ...prev, value }))}
      placeholder="201234567X or +65..."
      validate={payload.validate && payNowForm.type === "mobile"}
      invalidMessage={t(
        "validation.invalidPhone",
        "Enter a valid phone number (at least 3 digits)",
      )}
      dataTestId="payload-paynow-value-input"
      type="tel"
      isValid={isValidPhone}
    />
    <OptionalAmountField
      label={t("payload.amountSgd")}
      value={payNowForm.amount}
      onChange={(value) => setPayNowForm((prev) => ({ ...prev, amount: value }))}
      placeholder="50.00"
      step="0.01"
    />
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.referenceOptional")}</HighlightedLabel>
      </Label>
      <Input
        value={payNowForm.reference}
        onChange={(e) => setPayNowForm((prev) => ({ ...prev, reference: e.target.value }))}
        placeholder="Invoice 123"
        data-testid={DynamicTestId.resolve(
          "payload-paynow-reference-input",
          "payload-paynow-reference-input",
        )}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t("hints.paynowNote")}</p>
  </div>
);
