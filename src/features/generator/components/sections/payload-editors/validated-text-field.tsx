import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

export function ValidatedTextField({
  label,
  placeholder,
  value,
  onChange,
  invalid,
  invalidMessage,
  type = "text",
}: Readonly<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  invalidMessage: string;
  type?: "text" | "number";
}>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={invalid ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {invalid && <p className="text-xs text-destructive">{invalidMessage}</p>}
    </div>
  );
}
