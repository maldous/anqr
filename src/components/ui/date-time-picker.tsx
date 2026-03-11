'use client';

import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DateTimePickerProps {
  value: string; // datetime-local format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

/**
 * DateTimePicker component that provides a graphical calendar picker with time input.
 * Accepts and returns values in datetime-local format (YYYY-MM-DDTHH:mm).
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  className,
  disabled,
  'data-testid': testId,
}: Readonly<DateTimePickerProps>) {
  const [open, setOpen] = React.useState(false);

  // Parse the datetime-local value into date and time parts
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return new Date(value);
    } catch {
      return undefined;
    }
  }, [value]);

  const timeValue = React.useMemo(() => {
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return '12:00';
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [parsedDate]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Preserve the existing time or use current time
    const [hours, minutes] = timeValue.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    // Format as datetime-local value
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    onChange(`${year}-${month}-${day}T${hour}:${minute}`);
  };

  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime) return;

    // Use existing date or today
    const date =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? new Date(parsedDate) : new Date();

    const [hours, minutes] = newTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    onChange(`${year}-${month}-${day}T${hour}:${minute}`);
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return '';
    try {
      return format(parsedDate, 'PPP p'); // e.g., "Apr 29, 2024 at 10:30 AM"
    } catch {
      return '';
    }
  }, [parsedDate]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-testid={testId}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            'z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          align="start"
          sideOffset={4}
        >
          <Calendar mode="single" selected={parsedDate} onSelect={handleDateSelect} />
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="h-9 flex-1"
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
