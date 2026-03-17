import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidPhone } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../packages/ui/web/src/primitives/select";
import type { PromptPayForm } from "../payload-section-types";
import { OptionalAmountField } from "./optional-amount-field";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";

export const PromptpayEditor = ({
  payload,
  promptPayForm,
  setPromptPayForm,
  t,
}: Readonly<{
  payload: QRState["payload"];
  promptPayForm: PromptPayForm;
  setPromptPayForm: React.Dispatch<React.SetStateAction<PromptPayForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.idType")}</HighlightedLabel>
      </Label>
      <Select
        value={promptPayForm.type}
        onValueChange={(v) =>
          setPromptPayForm((prev) => ({ ...prev, type: v as "mobile" | "id" | "ewallet" }))
        }
      >
        <SelectTrigger
          data-testid={DynamicTestId.resolve(
            "payload-promptpay-type-select",
            "payload-promptpay-type-select",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mobile">{t("payload.mobileNumber")}</SelectItem>
          <SelectItem value="id">{t("payload.nationalIdTaxId")}</SelectItem>
          <SelectItem value="ewallet">E-Wallet ID</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <ValidatedLabeledInputField
      label={t("payload.promptPayId")}
      value={promptPayForm.value}
      onChange={(value) => setPromptPayForm((prev) => ({ ...prev, value }))}
      placeholder="0812345678"
      validate={payload.validate && promptPayForm.type === "mobile"}
      invalidMessage={t(
        "validation.invalidPhone",
        "Enter a valid phone number (at least 3 digits)",
      )}
      dataTestId="payload-promptpay-value-input"
      type="tel"
      isValid={isValidPhone}
    />
    <OptionalAmountField
      label={t("payload.amountThb")}
      value={promptPayForm.amount}
      onChange={(value) => setPromptPayForm((prev) => ({ ...prev, amount: value }))}
      placeholder="100.00"
      step="0.01"
    />
    <p className="text-xs text-muted-foreground">{t("hints.promptpayNote")}</p>
  </div>
);
