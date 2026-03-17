import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";

export function OptionalAmountField({
  label,
  value,
  onChange,
  placeholder,
  step,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  step?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
