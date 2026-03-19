import { isNonEmpty } from "@/application/generator";
import type { QRState } from "../../../../../state/qr-store";
import { ValidatedTextField } from "./validated-text-field";

export function MerchantNameField({
  invalidMessage,
  merchantName,
  onChange,
  payload,
  placeholder,
  label,
}: Readonly<{
  invalidMessage: string;
  label: string;
  merchantName: string;
  onChange: (value: string) => void;
  payload: QRState["payload"];
  placeholder: string;
}>) {
  return (
    <ValidatedTextField
      label={label}
      placeholder={placeholder}
      value={merchantName}
      onChange={onChange}
      invalid={payload.validate && !isNonEmpty(merchantName)}
      invalidMessage={invalidMessage}
    />
  );
}
