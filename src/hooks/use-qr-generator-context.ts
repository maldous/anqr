import { useContext } from 'react';
import type { UseQRGeneratorResult } from './useQRGenerator.types';
import { QRGeneratorContext } from './useQRGenerator._internal';
import { QRGeneratorProvider } from './qr-generator-provider';

export function useQRGeneratorContext(): UseQRGeneratorResult {
  const ctx = useContext(QRGeneratorContext);
  if (!ctx) throw new Error('useQRGeneratorContext must be used within QRGeneratorProvider');
  return ctx;
}
