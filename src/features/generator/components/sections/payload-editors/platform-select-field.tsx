import { HighlightedLabel } from "@/features/generator/search/search-context";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { Label } from "@/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";

export function PlatformSelectField({
  label,
  value,
  onValueChange,
  options,
  dataTestId,
}: Readonly<{
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  dataTestId: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger data-testid={DynamicTestId.resolve(dataTestId, dataTestId)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
