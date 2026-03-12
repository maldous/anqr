import type { UseQRGeneratorResult } from '@/features/generator/hooks/hooks-shared-types';
import { useContext } from 'react';
import { QRGeneratorContext } from './hooks-fn-context._internal';
import { QRGeneratorProvider } from './qr-generator-provider';

export function useQRGeneratorContext(): UseQRGeneratorResult {
  const ctx = useContext(QRGeneratorContext);
  if (!ctx) throw new Error('useQRGeneratorContext must be used within QRGeneratorProvider');
  return ctx;
}
