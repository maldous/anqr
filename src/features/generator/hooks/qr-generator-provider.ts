import { useQRGenerator } from '@/hooks/useQRGenerator';
import { createElement, type ReactNode } from 'react';
import { QRGeneratorContext } from './hooks-fn-context._internal';

export function QRGeneratorProvider({ children }: Readonly<{ children: ReactNode }>) {
  const value = useQRGenerator();
  return createElement(QRGeneratorContext.Provider, { value }, children);
}
