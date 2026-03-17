import type { ReactNode } from "react";
import { HighlightedLabel } from "../../search/search-context";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { ConnectedHelpLink as HelpLink } from "./connected-help-link";
import { Label } from "@/ui/primitives/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/ui/primitives/select";

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
