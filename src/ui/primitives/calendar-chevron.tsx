'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarChevron({
  orientation,
}: Readonly<{ orientation?: 'left' | 'right' | 'up' | 'down' }>) {
  return orientation === 'left' ? (
    <ChevronLeft className="h-4 w-4" />
  ) : (
    <ChevronRight className="h-4 w-4" />
  );
}
