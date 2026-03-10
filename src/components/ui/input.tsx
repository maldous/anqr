import * as React from 'react';
import { useDynamicTestId } from '@/components/ui/dynamic-testid';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const testId = useDynamicTestId(props, 'input');
    return (
      <input
        type={type}
        data-testid={testId}
        className={cn(
          'flex h-[var(--size-control-md)] w-full rounded-[var(--radius-control-md)] border border-input bg-background px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--type-size-sm)] ring-offset-background transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] file:border-0 file:bg-transparent file:text-[length:var(--type-size-sm)] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
