import { useContext } from 'react';
import type { UseQRGeneratorResult } from './useQRGenerator.types';
import { QRGeneratorContext } from './qr-generator-context';

export function useQRGeneratorContext(): UseQRGeneratorResult {
  const ctx = useContext(QRGeneratorContext);
  if (!ctx) throw new Error('useQRGeneratorContext must be used within QRGeneratorProvider');
  return ctx;
}
