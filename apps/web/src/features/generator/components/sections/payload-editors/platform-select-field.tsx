import {
    Label, Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/ui/web";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../../search/search-context";

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
