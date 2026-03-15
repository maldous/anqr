import type { ReactNode } from 'react';

export function PayloadFormShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="space-y-4">{children}</div>;
}
