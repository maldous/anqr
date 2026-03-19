import {
    Input, Label, Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/ui/web";
import type { EditorProps } from "../payload-editor.types";
import type { EMVGenericForm } from "../payload-section-types";

export function EmvGenericEditor({
  emvGenericForm,
  payload: _payload,
  setEmvGenericForm,
  t,
}: Readonly<Pick<EditorProps, "emvGenericForm" | "payload" | "setEmvGenericForm" | "t">>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("payload.merchantName")}</Label>
        <Input
          placeholder={t("placeholders.fullName")}
          value={emvGenericForm.merchantName}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, merchantName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t("payload.city")} {t("common.optional")}
        </Label>
        <Input
          placeholder="Singapore"
          value={emvGenericForm.merchantCity}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, merchantCity: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>{t("placeholders.countryCode")}</Label>
          <Input
            placeholder="SG"
            maxLength={2}
            value={emvGenericForm.countryCode}
            onChange={(e) =>
              setEmvGenericForm({
                ...emvGenericForm,
                countryCode: e.target.value.toUpperCase(),
              })
            }
          />
          <p className="text-xs text-muted-foreground">{t("placeholders.isoCountryHint")}</p>
        </div>
        <div className="space-y-2">
          <Label>{t("placeholders.currencyCode")}</Label>
          <Input
            placeholder="702"
            maxLength={3}
            value={emvGenericForm.currencyCode}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, currencyCode: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">{t("placeholders.isoCurrencyHint")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            {t("payload.amount")} {t("common.optional")}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={emvGenericForm.amount}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            {t("placeholders.mcc")} {t("common.optional")}
          </Label>
          <Input
            placeholder="5411"
            maxLength={4}
            value={emvGenericForm.mcc}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, mcc: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("placeholders.tipConvenienceFee")}</Label>
        <Select
          value={emvGenericForm.tipIndicator}
          onValueChange={(v: EMVGenericForm["tipIndicator"]) =>
            setEmvGenericForm({ ...emvGenericForm, tipIndicator: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("common.none")}</SelectItem>
            <SelectItem value="prompt">{t("placeholders.promptUser")}</SelectItem>
            <SelectItem value="fixed">{t("placeholders.fixedAmount")}</SelectItem>
            <SelectItem value="percent">{t("placeholders.percentageOption")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {emvGenericForm.tipIndicator === "fixed" && (
        <div className="space-y-2">
          <Label>{t("placeholders.tipAmount")}</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={emvGenericForm.tipAmount}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, tipAmount: e.target.value })}
          />
        </div>
      )}
      {emvGenericForm.tipIndicator === "percent" && (
        <div className="space-y-2">
          <Label>{t("placeholders.tipPercentage")}</Label>
          <Input
            type="number"
            placeholder="10"
            value={emvGenericForm.tipPercent}
            onChange={(e) => setEmvGenericForm({ ...emvGenericForm, tipPercent: e.target.value })}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>
          {t("payload.reference")} {t("common.optional")}
        </Label>
        <Input
          placeholder={t("placeholders.invoiceReference")}
          value={emvGenericForm.reference}
          onChange={(e) => setEmvGenericForm({ ...emvGenericForm, reference: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t("placeholders.emvGenericHint")}</p>
    </div>
  );
}
