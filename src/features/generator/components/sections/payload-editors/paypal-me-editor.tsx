import { isValidPayPalUsername } from "@/modules/payload-generators";
import type { EditorProps } from "../payload-editor-props";
import { OptionalAmountField } from "./optional-amount-field";
import { ValidatedHandleField } from "./validated-handle-field";

export function PaypalMeEditor({
  payload,
  paypalMeForm,
  setPaypalMeForm,
  t,
}: Readonly<Pick<EditorProps, "payload" | "paypalMeForm" | "setPaypalMeForm" | "t">>) {
  return (
    <div className="space-y-4">
      <ValidatedHandleField
        label={t("placeholders.paypalMeUsername")}
        placeholder={t("placeholders.yourname")}
        value={paypalMeForm.username}
        onChange={(value) => setPaypalMeForm({ ...paypalMeForm, username: value })}
        invalid={
          payload.validate &&
          paypalMeForm.username !== "" &&
          !isValidPayPalUsername(paypalMeForm.username)
        }
        invalidMessage={t(
          "validation.invalidPayPalUsername",
          "Enter a valid PayPal.Me username (4-20 alphanumeric characters)",
        )}
        hint={t("placeholders.paypalMeHint")}
      />
      <OptionalAmountField
        label={`${t("payload.amount")} ${t("common.optional")}`}
        value={paypalMeForm.amount}
        onChange={(value) => setPaypalMeForm({ ...paypalMeForm, amount: value })}
        placeholder="0.00"
      />
    </div>
  );
}
