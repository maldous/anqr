import type { ReactNode } from "react";
import {
  DynamicTestId,
  HighlightedLabel,
  Label,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./section-ui";

export function LabeledTestIdSelectField({
  contentTestId,
  label,
  onValueChange,
  triggerTestId,
  value,
  children,
}: Readonly<{
  children: ReactNode;
  contentTestId?: string;
  label: string;
  onValueChange: (value: string) => void;
  triggerTestId?: string;
  value: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-testid={
            triggerTestId ? DynamicTestId.resolve(triggerTestId, triggerTestId) : undefined
          }
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          data-testid={
            contentTestId ? DynamicTestId.resolve(contentTestId, contentTestId) : undefined
          }
        >
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}
