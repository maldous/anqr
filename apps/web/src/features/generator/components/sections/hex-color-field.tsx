import { Input, Label } from "@/ui/web";
import { DynamicTestId } from "../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../search/search-context";

export function HexColorField({
  label,
  pickerTestId,
  pickerTitle,
  textTestId,
  textTitle,
  value,
  onChange,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  pickerTestId: string;
  pickerTitle: string;
  textTestId: string;
  textTitle: string;
  value: string;
}>) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <div className="flex gap-2">
        <Input
          data-testid={DynamicTestId.resolve(pickerTestId, pickerTestId)}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 p-1 cursor-pointer"
          title={pickerTitle}
        />
        <Input
          data-testid={DynamicTestId.resolve(textTestId, textTestId)}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          title={textTitle}
        />
      </div>
    </div>
  );
}
