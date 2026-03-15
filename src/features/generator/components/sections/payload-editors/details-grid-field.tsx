import type { ReactNode } from 'react';

export function DetailsGridField({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}
