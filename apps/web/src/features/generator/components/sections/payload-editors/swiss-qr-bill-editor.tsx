import type { TFunction } from "i18next";
import { isValidIBAN } from "@/modules/payload-generators";
import type { QRState } from "@/store/qr-store";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";
import type { SwissQRBillForm } from "../payload-section-types";

export const SwissQrBillEditor = ({
  payload,
  setSwissQrBillForm,
  swissQrBillForm,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setSwissQrBillForm: React.Dispatch<React.SetStateAction<SwissQRBillForm>>;
  swissQrBillForm: SwissQRBillForm;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t("payload.iban")}</Label>
      <Input
        placeholder="CH93 0076 2011 6238 5295 7"
        value={swissQrBillForm.creditorIBAN}
        onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, creditorIBAN: e.target.value })}
        className={
          payload.validate &&
          swissQrBillForm.creditorIBAN &&
          !isValidIBAN(swissQrBillForm.creditorIBAN)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
      />
      {payload.validate &&
        swissQrBillForm.creditorIBAN &&
        !isValidIBAN(swissQrBillForm.creditorIBAN) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidIBAN", "Enter a valid IBAN")}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>{t("payload.beneficiaryName")}</Label>
      <Input
        placeholder={t("placeholders.fullName")}
        value={swissQrBillForm.creditorName}
        onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, creditorName: e.target.value })}
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>
          {t("payload.city")} {t("common.optional")}
        </Label>
        <Input
          placeholder={t("placeholders.zurich")}
          value={swissQrBillForm.creditorCity}
          onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, creditorCity: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("payload.country")}</Label>
        <Select
          value={swissQrBillForm.creditorCountry}
          onValueChange={(v) => setSwissQrBillForm({ ...swissQrBillForm, creditorCountry: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CH">{t("placeholders.switzerland")}</SelectItem>
            <SelectItem value="LI">{t("placeholders.liechtenstein")}</SelectItem>
          </SelectContent>
        </Select>
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
          value={swissQrBillForm.amount}
          onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, amount: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("placeholders.currency")}</Label>
        <Select
          value={swissQrBillForm.currency}
          onValueChange={(v: "CHF" | "EUR") =>
            setSwissQrBillForm({ ...swissQrBillForm, currency: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CHF">CHF</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>{t("placeholders.referenceType")}</Label>
        <Select
          value={swissQrBillForm.referenceType}
          onValueChange={(v: "QRR" | "SCOR" | "NON") =>
            setSwissQrBillForm({ ...swissQrBillForm, referenceType: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="QRR">{t("placeholders.qrReference")}</SelectItem>
            <SelectItem value="SCOR">{t("placeholders.creditorRefIso")}</SelectItem>
            <SelectItem value="NON">{t("common.none")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          {t("payload.reference")} {t("common.optional")}
        </Label>
        <Input
          placeholder={t("placeholders.invoiceReference")}
          value={swissQrBillForm.reference}
          onChange={(e) => setSwissQrBillForm({ ...swissQrBillForm, reference: e.target.value })}
        />
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{t("placeholders.swissQrBillHint")}</p>
  </div>
);
