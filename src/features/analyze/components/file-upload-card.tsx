import { Loader2, Upload } from 'lucide-react';
import type React from 'react';
import type { useTranslation } from 'react-i18next';

export function FileUploadCard({
  t,
  isLoading,
  isLoadingFile,
  handleFileUpload,
}: Readonly<{
  t: ReturnType<typeof useTranslation>['t'];
  isLoading: boolean;
  isLoadingFile: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) {
  return (
    <label className="relative group cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isLoading}
      />
      <div
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all h-full shadow-sm ${
          isLoadingFile
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary hover:bg-primary/5'
        }`}
      >
        {isLoadingFile ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">{t('analyze.uploadFile', 'Upload')}</p>
          <p className="text-[10px] text-muted-foreground">
            {t('analyze.uploadHint', 'Click or drop')}
          </p>
        </div>
      </div>
    </label>
  );
}
