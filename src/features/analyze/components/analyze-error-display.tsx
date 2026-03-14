import { AlertCircle } from 'lucide-react';
import type { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';

export function AnalyzeErrorDisplay({
  error,
  handleReset,
  t,
}: Readonly<{
  error: string;
  handleReset: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}>) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{t('analyze.error', 'Analysis Failed')}</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleReset}>
        {t('analyze.tryAgain', 'Try Again')}
      </Button>
    </div>
  );
}
