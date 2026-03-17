import type { ReactNode } from "react";
import type { QRState } from "../../../../../state/qr-store";
import { CityAmountFields } from "./city-amount-fields";
import { MerchantNameField } from "./merchant-name-field";
import { ValidatedTextField } from "./validated-text-field";

export function MerchantCityAmountEditor({
  amountLabel,
  amountPlaceholder,
  amountValue,
  cityLabel,
  cityPlaceholder,
  cityValue,
  hint,
  invalidMessage,
  merchantName,
  merchantNamePlaceholder,
  onAmountChange,
  onCityChange,
  onMerchantNameChange,
  onPrimaryChange,
  payload,
  primaryInvalid,
  primaryInvalidMessage,
  primaryLabel,
  primaryPlaceholder,
  primaryValue,
}: Readonly<{
  amountLabel: string;
  amountPlaceholder: string;
  amountValue: string;
  cityLabel: string;
  cityPlaceholder: string;
  cityValue: string;
  hint: ReactNode;
  invalidMessage: string;
  merchantName: string;
  merchantNamePlaceholder: string;
  onAmountChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onMerchantNameChange: (value: string) => void;
  onPrimaryChange: (value: string) => void;
  payload: QRState["payload"];
  primaryInvalid: boolean;
  primaryInvalidMessage: string;
  primaryLabel: string;
  primaryPlaceholder: string;
  primaryValue: string;
}>) {
  return (
    <div className="space-y-4">
      <ValidatedTextField
        label={primaryLabel}
        placeholder={primaryPlaceholder}
        value={primaryValue}
        onChange={onPrimaryChange}
        invalid={primaryInvalid}
        invalidMessage={primaryInvalidMessage}
      />
      <MerchantNameField
        invalidMessage={invalidMessage}
        label="Merchant Name"
        merchantName={merchantName}
        onChange={onMerchantNameChange}
        payload={payload}
        placeholder={merchantNamePlaceholder}
      />
      <CityAmountFields
        cityLabel={cityLabel}
        cityPlaceholder={cityPlaceholder}
        cityValue={cityValue}
        onCityChange={onCityChange}
        amountLabel={amountLabel}
        amountPlaceholder={amountPlaceholder}
        amountValue={amountValue}
        onAmountChange={onAmountChange}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
