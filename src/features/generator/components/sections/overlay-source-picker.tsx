import { Camera as CameraIcon, Image as ImageIcon, Link, Loader2, Upload } from 'lucide-react';
import type { useOverlaySourceActions } from './use-overlay-source-actions';
import { Capacitor } from '@capacitor/core';
import type React from 'react';
import { Button } from '@/ui/primitives/button';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { GALLERY_IMAGES } from './overlay-section-manifest';

export function OverlaySourcePicker({
  fileInputRef,
  cameraError,
  cameraLoading,
  showUrlInput,
  setShowUrlInput,
  showGalleryPicker,
  setShowGalleryPicker,
  galleryLoading,
  isLoadingUrl,
  urlInput,
  setUrlInput,
  urlError,
  setUrlError,
  sourceActions,
  t,
}: Readonly<{
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraError: string | null;
  cameraLoading: boolean;
  showUrlInput: boolean;
  setShowUrlInput: (v: boolean) => void;
  showGalleryPicker: boolean;
  setShowGalleryPicker: (v: boolean) => void;
  galleryLoading: boolean;
  isLoadingUrl: boolean;
  urlInput: string;
  setUrlInput: (v: string) => void;
  urlError: string | null;
  setUrlError: (v: string | null) => void;
  sourceActions: ReturnType<typeof useOverlaySourceActions>;
  t: (key: string, options?: Record<string, unknown>) => string;
}>) {
  return (
    <div className="space-y-2">
      {cameraError && (
        <div className="p-2 rounded-md bg-destructive/10 text-destructive text-sm">
          {cameraError}
        </div>
      )}
      <div className={`grid gap-2 ${Capacitor.isNativePlatform() ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <Button
          variant="outline"
          className="flex flex-col items-center justify-center h-16 p-2"
          onClick={() => fileInputRef.current?.click()}
          data-testid={DynamicTestId.resolve('overlay-upload', 'overlay-upload')}
        >
          <Upload className="h-5 w-5 mb-1" />
          <span className="text-xs">{t('overlay.upload')}</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center justify-center h-16 p-2"
          onClick={() => setShowUrlInput(!showUrlInput)}
          data-testid={DynamicTestId.resolve('overlay-from-url-button', 'overlay-from-url-button')}
        >
          <Link className="h-5 w-5 mb-1" />
          <span className="text-xs">{t('payload.url')}</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center justify-center h-16 p-2"
          onClick={() => setShowGalleryPicker(!showGalleryPicker)}
          disabled={galleryLoading}
          data-testid={DynamicTestId.resolve('overlay-gallery-button', 'overlay-gallery-button')}
        >
          {galleryLoading ? (
            <Loader2 className="h-5 w-5 mb-1 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5 mb-1" />
          )}
          <span className="text-xs">{t('nav.gallery')}</span>
        </Button>
        {Capacitor.isNativePlatform() && (
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 p-2"
            onClick={sourceActions.handleCameraCapture}
            disabled={cameraLoading}
            data-testid={DynamicTestId.resolve('overlay-photo-button', 'overlay-photo-button')}
          >
            {cameraLoading ? (
              <Loader2 className="h-5 w-5 mb-1 animate-spin" />
            ) : (
              <CameraIcon className="h-5 w-5 mb-1" />
            )}
            <span className="text-xs">{t('overlay.photo')}</span>
          </Button>
        )}
      </div>
      {showGalleryPicker && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/30">
          <Label className="text-sm">{t('overlay.selectImage')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {GALLERY_IMAGES.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => sourceActions.loadGalleryImage(img.url)}
                className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-colors"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <span className="text-xs text-white font-medium">{img.name}</span>
                  {img.isAnimated && <span className="text-xs text-white/70 ml-1">(GIF)</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {showUrlInput && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/30">
          <Label className="text-sm">{t('overlay.imageUrl')}</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://anqr.link/image.gif"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && sourceActions.loadFromUrl()}
              className="flex-1"
            />
            <Button
              onClick={sourceActions.loadFromUrl}
              disabled={isLoadingUrl || !urlInput.trim()}
              size="sm"
              data-testid={DynamicTestId.resolve(
                'overlay-load-url-button',
                'overlay-load-url-button'
              )}
            >
              {isLoadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : t('overlay.load')}
            </Button>
          </div>
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          <p className="text-xs text-muted-foreground">{t('overlay.corsNote')}</p>
        </div>
      )}
    </div>
  );
}
