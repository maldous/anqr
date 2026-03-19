import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../../search/search-context";
import { Input } from "@/ui/web";
import { Label } from "@/ui/web";

export function LabeledInputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  dataTestId,
}: Readonly<{
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "url" | "datetime-local" | "number" | "tel" | "date";
  dataTestId?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        data-testid={dataTestId ? DynamicTestId.resolve(dataTestId, dataTestId) : undefined}
      />
    </div>
  );
}
