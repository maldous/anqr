import { Input } from "@/ui/web";
import { Label } from "@/ui/web";

export function ValidatedHandleField({
  label,
  placeholder,
  value,
  onChange,
  invalid,
  invalidMessage,
  hint,
  prefix,
}: Readonly<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  invalidMessage: string;
  hint: string;
  prefix?: string;
}>) {
  const input = (
    <Input
      placeholder={placeholder}
      className={`${prefix ? "pl-7 " : ""}${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {prefix ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {invalid && <p className="text-xs text-destructive">{invalidMessage}</p>}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
