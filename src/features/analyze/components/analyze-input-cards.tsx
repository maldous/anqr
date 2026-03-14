import { Capacitor } from '@capacitor/core';
import { QrCode, Upload } from 'lucide-react';
import type React from 'react';
import type { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import type { AnalysisSourceType } from './analysis-source-type';
import { CameraCardButton } from './camera-card-button';
import { FileUploadCard } from './file-upload-card';
import { GeneratorCardActive } from './generator-card-active';
import { GeneratorCardDisabled } from './generator-card-disabled';
import { UrlInputCard } from './url-input-card';

export function AnalyzeInputCards({
  t,
  generatedCanvas,
  isLoading,
  loadingSource,
  urlInput,
  setUrlInput,
  handleAnalyzeGenerator,
  handleFileUpload,
  handleUrlSubmit,
  handleCameraCapture,
}: Readonly<{
  t: ReturnType<typeof useTranslation>['t'];
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  isLoading: boolean;
  loadingSource: AnalysisSourceType;
  urlInput: string;
  setUrlInput: (v: string) => void;
  handleAnalyzeGenerator: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlSubmit: () => void;
  handleCameraCapture: () => void;
}>) {
  return (
    <div
      className={`grid gap-3 ${Capacitor.isNativePlatform() ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}
    >
      {generatedCanvas ? (
        <GeneratorCardActive
          t={t}
          isLoadingGenerator={isLoading && loadingSource === 'generator'}
          handleAnalyzeGenerator={handleAnalyzeGenerator}
          isLoading={isLoading}
        />
      ) : (
        <GeneratorCardDisabled t={t} />
      )}
      <FileUploadCard
        t={t}
        isLoading={isLoading}
        isLoadingFile={isLoading && loadingSource === 'file'}
        handleFileUpload={handleFileUpload}
      />
      <UrlInputCard
        t={t}
        isLoading={isLoading}
        isLoadingUrl={isLoading && loadingSource === 'url'}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        handleUrlSubmit={handleUrlSubmit}
      />
      {Capacitor.isNativePlatform() && (
        <CameraCardButton
          t={t}
          isLoading={isLoading}
          isLoadingCamera={isLoading && loadingSource === 'camera'}
          handleCameraCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}
