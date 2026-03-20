import { Label, Select, SelectContent, SelectTrigger, SelectValue } from "@/ui/web";
import type { ReactNode } from "react";
import { DynamicTestId } from "../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../search/search-context";
import { ConnectedHelpLink as HelpLink } from "./connected-help-link";

export function LabeledHelpSelectField({
  anchor,
  children,
  label,
  onValueChange,
  testId,
  title,
  value,
}: Readonly<{
  anchor?: string;
  children: ReactNode;
  label: string;
  onValueChange: (value: string) => void;
  testId: string;
  title?: string;
  value: string;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label>
          <HighlightedLabel>{label}</HighlightedLabel>
        </Label>
        {anchor ? <HelpLink anchor={anchor} /> : null}
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger data-testid={DynamicTestId.resolve(testId, testId)} title={title}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
