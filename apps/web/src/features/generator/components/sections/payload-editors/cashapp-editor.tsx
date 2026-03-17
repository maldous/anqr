import { isValidCashtag } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { EditorProps } from "../payload-editor.types";
import { OptionalAmountField } from "./optional-amount-field";
import { ValidatedHandleField } from "./validated-handle-field";

export function CashappEditor({
  cashappForm,
  payload,
  setCashappForm,
  t,
}: Readonly<Pick<EditorProps, "cashappForm" | "payload" | "setCashappForm" | "t">>) {
  return (
    <div className="space-y-4">
      <ValidatedHandleField
        label={t("placeholders.cashtag")}
        placeholder={t("placeholders.yourname")}
        value={cashappForm.cashtag}
        onChange={(value) => setCashappForm({ ...cashappForm, cashtag: value.replace(/^\$/, "") })}
        invalid={
          payload.validate && cashappForm.cashtag !== "" && !isValidCashtag(cashappForm.cashtag)
        }
        invalidMessage={t(
          "validation.invalidCashtag",
          "Enter a valid $cashtag (starts with letter, alphanumeric)",
        )}
        hint={t("placeholders.cashappHint")}
        prefix="$"
      />
      <OptionalAmountField
        label={`${t("payload.amount")} ${t("common.optional")}`}
        value={cashappForm.amount}
        onChange={(value) => setCashappForm({ ...cashappForm, amount: value })}
        placeholder="0.00"
      />
    </div>
  );
}
