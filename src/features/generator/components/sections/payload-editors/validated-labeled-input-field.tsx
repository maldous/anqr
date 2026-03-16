import { HighlightedLabel } from "@/features/generator/search/search-context";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

export function ValidatedLabeledInputField({
  label,
  value,
  onChange,
  placeholder,
  validate,
  invalidMessage,
  dataTestId,
  type,
  isValid,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  validate: boolean;
  invalidMessage: string;
  dataTestId: string;
  type: "email" | "tel";
  isValid: (value: string) => boolean;
}>) {
  const isInvalid = validate && value !== "" && !isValid(value);

  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={DynamicTestId.resolve(dataTestId, dataTestId)}
        className={isInvalid ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {isInvalid && <p className="text-xs text-destructive">{invalidMessage}</p>}
    </div>
  );
}
