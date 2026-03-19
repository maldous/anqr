import {
  isValidABN,
  isValidEmail,
  isValidPhone,
} from "../../../../../../../../packages/domain/payload/src/payload-generators";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../packages/ui/web/src/primitives/select";
import type { EditorProps } from "../payload-editor.types";
import type { AusPayNetForm } from "../payload-section-types";

export function AuspaynetEditor({
  auspaynetForm,
  payload,
  setAuspaynetForm,
  t,
}: Readonly<Pick<EditorProps, "auspaynetForm" | "payload" | "setAuspaynetForm" | "t">>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("placeholders.payIdType")}</Label>
        <Select
          value={auspaynetForm.payIdType}
          onValueChange={(v: AusPayNetForm["payIdType"]) =>
            setAuspaynetForm({ ...auspaynetForm, payIdType: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMAIL">{t("placeholders.emailOption")}</SelectItem>
            <SelectItem value="MOBILE">{t("placeholders.mobileOption")}</SelectItem>
            <SelectItem value="ABN">{t("placeholders.abn")}</SelectItem>
            <SelectItem value="ORG">{t("placeholders.organizationId")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("placeholders.payId")}</Label>
        <Input
          placeholder={(() => {
            if (auspaynetForm.payIdType === "EMAIL") return t("placeholders.emailExample");
            if (auspaynetForm.payIdType === "MOBILE") return "+61400123456";
            return "12345678901";
          })()}
          value={auspaynetForm.payId}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, payId: e.target.value })}
          className={
            payload.validate &&
            auspaynetForm.payId &&
            ((auspaynetForm.payIdType === "EMAIL" && !isValidEmail(auspaynetForm.payId)) ||
              (auspaynetForm.payIdType === "MOBILE" && !isValidPhone(auspaynetForm.payId)) ||
              (auspaynetForm.payIdType === "ABN" && !isValidABN(auspaynetForm.payId)))
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate &&
          auspaynetForm.payId &&
          ((auspaynetForm.payIdType === "EMAIL" && !isValidEmail(auspaynetForm.payId)) ||
            (auspaynetForm.payIdType === "MOBILE" && !isValidPhone(auspaynetForm.payId)) ||
            (auspaynetForm.payIdType === "ABN" && !isValidABN(auspaynetForm.payId))) && (
            <p className="text-xs text-destructive">
              {(() => {
                if (auspaynetForm.payIdType === "EMAIL")
                  return t(
                    "validation.invalidEmail",
                    "Enter a valid email address (must contain @)",
                  );
                if (auspaynetForm.payIdType === "ABN")
                  return t("validation.invalidABN", "Enter a valid ABN (11 digits)");
                return t(
                  "validation.invalidPhone",
                  "Enter a valid phone number (at least 3 digits)",
                );
              })()}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          {t("payload.merchantName")} {t("common.optional")}
        </Label>
        <Input
          placeholder={t("placeholders.fullName")}
          value={auspaynetForm.merchantName}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, merchantName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t("payload.amount")} (AUD) {t("common.optional")}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={auspaynetForm.amount}
          onChange={(e) => setAuspaynetForm({ ...auspaynetForm, amount: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t("placeholders.auspaynetHint")}</p>
    </div>
  );
}
