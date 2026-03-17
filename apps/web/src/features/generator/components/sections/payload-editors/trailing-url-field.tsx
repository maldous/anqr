import { LabeledInputField } from "./labeled-input-field";

export function TrailingUrlField({
  label,
  placeholder,
}: Readonly<{
  label: string;
  placeholder: string;
}>) {
  return <LabeledInputField label={label} placeholder={placeholder} type="url" />;
}
