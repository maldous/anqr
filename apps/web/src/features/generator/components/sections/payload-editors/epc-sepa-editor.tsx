import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../../search/search-context";
import { isValidIBAN } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import type { EditorProps } from "../payload-editor.types";

export function EpcSepaEditor({
  epcSepaForm,
  payload,
  setEpcSepaForm,
  t,
}: Readonly<Pick<EditorProps, "epcSepaForm" | "payload" | "setEpcSepaForm" | "t">>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.beneficiaryName")}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.name}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Company Ltd."
          data-testid={DynamicTestId.resolve("payload-epc-name-input", "payload-epc-name-input")}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.iban")}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.iban}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, iban: e.target.value }))}
          placeholder="DE89370400440532013000"
          data-testid={DynamicTestId.resolve("payload-epc-iban-input", "payload-epc-iban-input")}
          className={
            payload.validate && epcSepaForm.iban && !isValidIBAN(epcSepaForm.iban)
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate && epcSepaForm.iban && !isValidIBAN(epcSepaForm.iban) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidIBAN", "Enter a valid IBAN")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.bicSwift")}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.bic}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, bic: e.target.value }))}
          placeholder="COBADEFFXXX"
          data-testid={DynamicTestId.resolve("payload-epc-bic-input", "payload-epc-bic-input")}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.amountEur")}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={epcSepaForm.amount}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="100.00"
          data-testid={DynamicTestId.resolve(
            "payload-epc-amount-input",
            "payload-epc-amount-input",
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.reference")}</HighlightedLabel>
        </Label>
        <Input
          value={epcSepaForm.reference}
          onChange={(e) => setEpcSepaForm((prev) => ({ ...prev, reference: e.target.value }))}
          placeholder="Invoice 12345"
          data-testid={DynamicTestId.resolve(
            "payload-epc-reference-input",
            "payload-epc-reference-input",
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t("hints.epcSepaNote")}</p>
    </div>
  );
}
