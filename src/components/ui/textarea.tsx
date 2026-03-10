import * as React from 'react';
import { useDynamicTestId } from '@/components/ui/dynamic-testid';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const testId = useDynamicTestId(props, 'textarea');
    return (
      <textarea
        data-testid={testId}
        className={cn(
          'flex min-h-[calc(var(--size-control-md)*2)] w-full rounded-[var(--radius-control-md)] border border-input bg-background px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--type-size-sm)] ring-offset-background transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
