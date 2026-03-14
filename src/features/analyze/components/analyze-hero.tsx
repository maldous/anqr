import { Capacitor } from '@capacitor/core';
import { ScanLine } from 'lucide-react';
import type { useTranslation } from 'react-i18next';

export function AnalyzeHero({ t }: Readonly<{ t: ReturnType<typeof useTranslation>['t'] }>) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-2 shadow-lg shadow-primary/10">
        <ScanLine className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
        {t('analyze.title', 'QR Code Analyzer')}
      </h1>
      {!Capacitor.isNativePlatform() && (
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t(
            'analyze.description',
            'The most comprehensive QR code analyzer available. Extract every technical detail, visualize the module matrix, check WCAG compliance, and export analysis data for recreation.'
          )}
        </p>
      )}
    </div>
  );
}
