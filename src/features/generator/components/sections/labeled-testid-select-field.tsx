import type { ReactNode } from 'react';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { Label } from '@/ui/primitives/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/ui/primitives/select';

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
