import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  Camera as CameraIcon,
  Image as ImageIcon,
  Link,
  Loader2,
  Move,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DynamicTestId } from '@/components/ui/dynamic-testid';
import { HelpLink } from '@/components/ui/help-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { createLogger } from '@/lib/logger';
import { HighlightedLabel } from '@/lib/search-context';
import {
  type ColorMode,
  type DiffusionKernel,
  type DitherKind,
  type FitMode,
  type OrderedMatrix,
  type OverlayMode,
  useQRStore,
} from '@/store/qr-store';

const BASIC_OVERLAY_MODES: { value: OverlayMode; labelKey: string }[] = [
  { value: 'center', labelKey: 'overlay.centerLogo' },
  { value: 'blend', labelKey: 'overlay.blendMode' },
  { value: 'halftone', labelKey: 'overlay.halftoneMode' },
  { value: 'dithered', labelKey: 'overlay.ditheredMode' },
  { value: 'artwork', labelKey: 'overlay.artworkMode' },
];

const ADVANCED_OVERLAY_MODES: { value: OverlayMode; labelKey: string }[] = [
  { value: 'subpixel', labelKey: 'overlay.subpixelMode' },
  { value: 'blue-noise', labelKey: 'overlay.blueNoiseMode' },
  { value: 'halftone-dithered', labelKey: 'overlay.halftoneDitheredMode' },
  { value: 'mosaic', labelKey: 'overlay.mosaicMode' },
  { value: 'gapfill', labelKey: 'overlay.gapFillMode' },
  { value: 'brightness', labelKey: 'overlay.brightnessMode' },
  { value: 'duotone', labelKey: 'overlay.duotoneMode' },
];

const PRO_OVERLAY_MODES: { value: OverlayMode; labelKey: string }[] = [
  { value: 'pixelate', labelKey: 'overlay.pixelateMode' },
  { value: 'outline', labelKey: 'overlay.outlineMode' },
  { value: 'wave', labelKey: 'overlay.waveMode' },
  { value: 'subpixel-size', labelKey: 'overlay.subpixelSizeMode' },
  { value: 'dither', labelKey: 'overlay.trueDitherMode' },
  { value: 'extreme', labelKey: 'overlay.extremeMode' },
];

const log = createLogger('OVERLAY');

export function OverlaySection() {
  const {
    tier,
    overlay,
    setOverlayEnabled,
    setOverlayFile,
    setOverlayUrl,
    setOverlayMode,
    setOverlayIntensity,
    setOverlayColorMode,
    setOverlayPreserveFinders,
    setOverlayInvert,
    setOverlayBrightness,
    setOverlayContrast,
    setOverlayGamma,
    setOverlayFit,
    setOverlayRotate,
    setOverlayFlip,
    setOverlayDitherKind,
    setOverlayDiffusionKernel,
    setOverlayPreserveTiming,
    setOverlayPreserveAlignment,
    setOverlayCrop,
  } = useQRStore();
  const { t } = useTranslation();
  const allPreservationsEnabled =
    overlay.preserveFinders &&
    overlay.preserveTiming &&
    overlay.preserveAlignment &&
    overlay.protectFormatInfo &&
    overlay.protectVersionInfo;
  const setAllPreservations = (checked: boolean) =>
    useQRStore.setState((s) => ({
      overlay: {
        ...s.overlay,
        preserveFinders: checked,
        preserveTiming: checked,
        preserveAlignment: checked,
        protectFormatInfo: checked,
        protectVersionInfo: checked,
      },
    }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [urlInput, setUrlInput] = useState(overlay.url || '');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Create image preview URL when file or URL changes
  useEffect(() => {
    if (overlay.file) {
      const url = URL.createObjectURL(overlay.file);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (overlay.url) {
      setImagePreview(overlay.url);
    } else {
      setImagePreview(null);
    }
  }, [overlay.file, overlay.url]);

  // Load image from URL
  const loadFromUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      setUrlError(t('overlay.pleaseEnterUrl'));
      return;
    }

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      // Fetch the image (requires CORS or same-origin)
      const response = await fetch(urlInput, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      const blob = await response.blob();

      // Extract filename from URL
      const urlParts = urlInput.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image';

      // Create a File object from the blob
      const file = new File([blob], filename, { type: blob.type });

      // Store the URL for sharing purposes
      setOverlayUrl(urlInput);
      setOverlayFile(file);
      setOverlayEnabled(true); // Explicitly enable overlay
      setShowUrlInput(false);
    } catch (err) {
      log.error('Failed to load image from URL', { error: err });
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setUrlError('Cannot load: CORS blocked or invalid URL');
      } else {
        setUrlError(err instanceof Error ? err.message : 'Failed to load image');
      }
    } finally {
      setIsLoadingUrl(false);
    }
  }, [urlInput, setOverlayFile, setOverlayUrl, setOverlayEnabled, t]);

  // Camera capture for quick overlay (native only)
  const handleCameraCapture = useCallback(async () => {
    setCameraError(null);
    setCameraLoading(true);

    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'denied') {
        const requested = await Camera.requestPermissions();
        if (requested.camera === 'denied') {
          setCameraError(t('camera.permissionDenied'));
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setOverlayFile(file);
        setOverlayEnabled(true);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!(errorMessage.includes('cancelled') || errorMessage.includes('User cancelled'))) {
        if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
          setCameraError(t('camera.permissionDenied'));
        } else {
          setCameraError(t('camera.error'));
        }
      }
    } finally {
      setCameraLoading(false);
    }
  }, [t, setOverlayFile, setOverlayEnabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOverlayUrl(''); // Clear URL when file is selected
      setOverlayFile(file);
      setOverlayEnabled(true); // Auto-enable overlay when file is uploaded
    }
    // Reset input value so the same file can be selected again
    // This is necessary because browsers don't fire onChange if the value hasn't changed
    e.target.value = '';
  };

  const clearOverlay = () => {
    setOverlayFile(null);
    setOverlayUrl('');
    setUrlInput('');
    setUrlError(null);
  };

  // Built-in gallery images - use absolute URLs on native platforms
  const getGalleryImageUrl = (path: string) =>
    Capacitor.isNativePlatform() ? `https://anqr.link${path}` : path;

  const GALLERY_IMAGES = [
    { id: 'tsunami', name: 'Tsunami', url: getGalleryImageUrl('/tsunami.jpg'), isAnimated: false },
    { id: 'king', name: 'King', url: getGalleryImageUrl('/king.gif'), isAnimated: true },
    { id: 'logo', name: 'Logo', url: getGalleryImageUrl('/logo.png'), isAnimated: false },
    { id: 'test', name: 'Test', url: getGalleryImageUrl('/test.png'), isAnimated: false },
  ];

  // Load image from gallery
  const loadGalleryImage = useCallback(
    async (imageUrl: string) => {
      setGalleryLoading(true);
      setShowGalleryPicker(false);

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }

        const blob = await response.blob();
        const filename = imageUrl.split('/').pop() || 'gallery-image';
        const file = new File([blob], filename, { type: blob.type });

        setOverlayUrl(imageUrl);
        setOverlayFile(file);
        setOverlayEnabled(true);
      } catch (err) {
        log.error('Failed to load gallery image', { error: err });
      } finally {
        setGalleryLoading(false);
      }
    },
    [setOverlayFile, setOverlayUrl, setOverlayEnabled]
  );

  // Handle crop region drag (mouse)
  const handleCropDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!(isDragging && previewContainerRef.current)) return;
      e.preventDefault();

      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // Keep crop region centered on cursor, clamped to bounds
      const halfSize = overlay.cropRegion.size / 2;
      const clampedX = Math.max(halfSize, Math.min(1 - halfSize, x));
      const clampedY = Math.max(halfSize, Math.min(1 - halfSize, y));

      setOverlayCrop({ region: { ...overlay.cropRegion, x: clampedX, y: clampedY } });
    },
    [isDragging, overlay.cropRegion, setOverlayCrop]
  );

  // Handle crop region drag (touch for mobile)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!overlay.cropEnabled) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [overlay.cropEnabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!(isDragging && previewContainerRef.current) || e.touches.length === 0) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

      // Keep crop region centered on touch point, clamped to bounds
      const halfSize = overlay.cropRegion.size / 2;
      const clampedX = Math.max(halfSize, Math.min(1 - halfSize, x));
      const clampedY = Math.max(halfSize, Math.min(1 - halfSize, y));

      setOverlayCrop({ region: { ...overlay.cropRegion, x: clampedX, y: clampedY } });
    },
    [isDragging, overlay.cropRegion, setOverlayCrop]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const availableModes = [
    ...BASIC_OVERLAY_MODES,
    ...(tier === 'advanced' || tier === 'professional' ? ADVANCED_OVERLAY_MODES : []),
    ...(tier === 'professional' ? PRO_OVERLAY_MODES : []),
  ];

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <HighlightedLabel>{t('overlay.imageGifWebp')}</HighlightedLabel>
          <HelpLink anchor="overlays" />
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {overlay.file || overlay.url ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <span className="flex-1 text-sm truncate">
                {overlay.file?.name ||
                  (overlay.url ? t('overlay.loadedFromUrl') : t('overlay.noFile'))}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearOverlay}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Show source URL if loaded from URL */}
            {overlay.url && !overlay.file?.name && (
              <div className="text-xs text-muted-foreground truncate px-2">{overlay.url}</div>
            )}

            {/* Image Preview with Square Crop Selector */}
            {imagePreview && (
              <div
                ref={previewContainerRef}
                {...(overlay.cropEnabled && {
                  role: 'application',
                  tabIndex: 0,
                  'aria-label':
                    'Image preview with crop area selector. Drag to adjust crop position.',
                })}
                className="relative w-full aspect-square bg-muted/30 rounded-lg overflow-hidden border cursor-crosshair touch-none focus:outline-none focus:ring-2 focus:ring-ring"
                onMouseDown={() => overlay.cropEnabled && setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleCropDrag}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={imagePreview}
                  alt={t('overlay.preview')}
                  className="w-full h-full object-contain"
                  draggable={false}
                />

                {/* Square Crop Overlay */}
                {overlay.cropEnabled && (
                  <>
                    {/* Darkened area outside crop region */}
                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />

                    {/* Clear crop region */}
                    <div
                      className="absolute border-2 border-white shadow-lg pointer-events-none"
                      style={{
                        left: `${(overlay.cropRegion.x - overlay.cropRegion.size / 2) * 100}%`,
                        top: `${(overlay.cropRegion.y - overlay.cropRegion.size / 2) * 100}%`,
                        width: `${overlay.cropRegion.size * 100}%`,
                        height: `${overlay.cropRegion.size * 100}%`,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Corner handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />

                      {/* Center drag indicator */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Move className="h-6 w-6 text-white/70" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Crop Controls */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t('overlay.enableCrop')}</HighlightedLabel>
              </Label>
              <Switch
                checked={overlay.cropEnabled}
                onCheckedChange={(checked) => setOverlayCrop({ enabled: checked })}
                data-testid={DynamicTestId.resolve('overlay-crop-switch', 'overlay-crop-switch')}
              />
            </div>

            {overlay.cropEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('overlay.cropSize')}</Label>
                  <span className="text-sm text-muted-foreground">
                    {t('qr.nPercent', { count: Math.round(overlay.cropRegion.size * 100) })}
                  </span>
                </div>
                <Slider
                  value={[overlay.cropRegion.size]}
                  onValueChange={([v]) =>
                    setOverlayCrop({ region: { ...overlay.cropRegion, size: v } })
                  }
                  min={0.1}
                  max={1}
                  step={0.05}
                  data-testid={DynamicTestId.resolve('overlay-crop-slider', 'overlay-crop-slider')}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Camera error toast */}
            {cameraError && (
              <div className="p-2 rounded-md bg-destructive/10 text-destructive text-sm">
                {cameraError}
              </div>
            )}
            <div
              className={`grid gap-2 ${Capacitor.isNativePlatform() ? 'grid-cols-4' : 'grid-cols-3'}`}
            >
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
                data-testid={DynamicTestId.resolve(
                  'overlay-from-url-button',
                  'overlay-from-url-button'
                )}
              >
                <Link className="h-5 w-5 mb-1" />
                <span className="text-xs">{t('payload.url')}</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-16 p-2"
                onClick={() => setShowGalleryPicker(!showGalleryPicker)}
                disabled={galleryLoading}
                data-testid={DynamicTestId.resolve(
                  'overlay-gallery-button',
                  'overlay-gallery-button'
                )}
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
                  onClick={handleCameraCapture}
                  disabled={cameraLoading}
                  data-testid={DynamicTestId.resolve(
                    'overlay-photo-button',
                    'overlay-photo-button'
                  )}
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

            {/* Gallery Picker */}
            {showGalleryPicker && (
              <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                <Label className="text-sm">{t('overlay.selectImage')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GALLERY_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => loadGalleryImage(img.url)}
                      className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-colors"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <span className="text-xs text-white font-medium">{img.name}</span>
                        {img.isAnimated && (
                          <span className="text-xs text-white/70 ml-1">(GIF)</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input */}
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
                    onKeyDown={(e) => e.key === 'Enter' && loadFromUrl()}
                    className="flex-1"
                  />
                  <Button
                    onClick={loadFromUrl}
                    disabled={isLoadingUrl || !urlInput.trim()}
                    size="sm"
                    data-testid={DynamicTestId.resolve(
                      'overlay-load-url-button',
                      'overlay-load-url-button'
                    )}
                  >
                    {isLoadingUrl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('overlay.load')
                    )}
                  </Button>
                </div>
                {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                <p className="text-xs text-muted-foreground">{t('overlay.corsNote')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <Label>
          <HighlightedLabel>{t('common.enabled')}</HighlightedLabel>
        </Label>
        <Switch
          checked={overlay.enabled}
          onCheckedChange={setOverlayEnabled}
          disabled={!overlay.file}
          data-testid={DynamicTestId.resolve('overlay-enabled-switch', 'overlay-enabled-switch')}
        />
      </div>

      {overlay.enabled && (
        <>
          {/* Overlay Mode */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <HighlightedLabel>{t('overlay.mode')}</HighlightedLabel>
              <HelpLink anchor="overlay-modes" />
            </Label>
            <Select value={overlay.mode} onValueChange={(v) => setOverlayMode(v as OverlayMode)}>
              <SelectTrigger
                data-testid={DynamicTestId.resolve('overlay-mode-select', 'overlay-mode-select')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve('overlay-mode-content', 'overlay-mode-content')}
              >
                {availableModes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {t(m.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                <HighlightedLabel>{t('overlay.intensity')}</HighlightedLabel>
                <HelpLink anchor="overlay-modes" />
              </Label>
              <span className="text-sm text-muted-foreground">
                {t('qr.nPercent', { count: overlay.intensity })}
              </span>
            </div>
            <Slider
              value={[overlay.intensity]}
              onValueChange={([v]) => setOverlayIntensity(v)}
              min={0}
              max={100}
              step={1}
              data-testid={DynamicTestId.resolve(
                'overlay-intensity-slider',
                'overlay-intensity-slider'
              )}
            />
          </div>

          {/* Color Mode */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('overlay.colorMode')}</HighlightedLabel>
            </Label>
            <Select
              value={overlay.colorMode}
              onValueChange={(v) => setOverlayColorMode(v as ColorMode)}
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'overlay-color-mode-select',
                  'overlay-color-mode-select'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'overlay-color-mode-content',
                  'overlay-color-mode-content'
                )}
              >
                <SelectItem value="color">{t('overlay.fullColor')}</SelectItem>
                <SelectItem value="grayscale">{t('overlay.grayscale')}</SelectItem>
                <SelectItem value="bw">{t('overlay.bw')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Options */}
          {(tier === 'advanced' || tier === 'professional') && (
            <>
              {/* Preservation / Protection */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-muted-foreground flex items-center gap-1.5">
                  {t('overlay.protection')}
                  <HelpLink anchor="protection" />
                </Label>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Preserve All</Label>
                  <Switch checked={allPreservationsEnabled} onCheckedChange={setAllPreservations} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    <HighlightedLabel>{t('overlay.preserveFinders')}</HighlightedLabel>
                  </Label>
                  <Switch
                    checked={overlay.preserveFinders}
                    onCheckedChange={setOverlayPreserveFinders}
                    data-testid={DynamicTestId.resolve(
                      'overlay-preserve-finders-switch',
                      'overlay-preserve-finders-switch'
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('overlay.preserveTiming')}</Label>
                  <Switch
                    checked={overlay.preserveTiming}
                    onCheckedChange={setOverlayPreserveTiming}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('overlay.preserveAlignment')}</Label>
                  <Switch
                    checked={overlay.preserveAlignment}
                    onCheckedChange={setOverlayPreserveAlignment}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('overlay.protectFormatInfo')}</Label>
                  <Switch
                    checked={overlay.protectFormatInfo}
                    onCheckedChange={(checked) =>
                      useQRStore.setState((s) => ({
                        overlay: { ...s.overlay, protectFormatInfo: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('overlay.protectVersionInfo')}</Label>
                  <Switch
                    checked={overlay.protectVersionInfo}
                    onCheckedChange={(checked) =>
                      useQRStore.setState((s) => ({
                        overlay: { ...s.overlay, protectVersionInfo: checked },
                      }))
                    }
                  />
                </div>

                {['dithered', 'blue-noise', 'dither', 'halftone-dithered'].includes(overlay.mode) &&
                  !(
                    overlay.preserveFinders &&
                    overlay.preserveAlignment &&
                    overlay.preserveTiming &&
                    overlay.protectFormatInfo &&
                    overlay.protectVersionInfo
                  ) && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Preservation Strength</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('qr.nPercent', { count: overlay.finderDitherStrength })}
                        </span>
                      </div>
                      <Slider
                        value={[overlay.finderDitherStrength]}
                        onValueChange={([v]) =>
                          useQRStore.setState((s) => ({
                            overlay: { ...s.overlay, finderDitherStrength: v },
                          }))
                        }
                        min={0}
                        max={100}
                        step={5}
                        data-testid={DynamicTestId.resolve(
                          'overlay-finder-dither-strength-slider',
                          'overlay-finder-dither-strength-slider'
                        )}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <Label className="text-sm">Blend Preservations</Label>
                        <Switch
                          checked={overlay.blendPreservations}
                          onCheckedChange={(checked) =>
                            useQRStore.setState((s) => ({
                              overlay: { ...s.overlay, blendPreservations: checked },
                            }))
                          }
                          data-testid={DynamicTestId.resolve(
                            'overlay-blend-preservations-switch',
                            'overlay-blend-preservations-switch'
                          )}
                        />
                      </div>
                    </div>
                  )}
              </div>

              {/* Invert */}
              <div className="flex items-center justify-between">
                <Label>
                  <HighlightedLabel>{t('overlay.invert')}</HighlightedLabel>
                </Label>
                <Switch checked={overlay.invert} onCheckedChange={setOverlayInvert} />
              </div>

              {/* Fit Mode */}
              <div className="space-y-2">
                <Label>
                  <HighlightedLabel>{t('overlay.fitMode')}</HighlightedLabel>
                </Label>
                <Select value={overlay.fit} onValueChange={(v) => setOverlayFit(v as FitMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">{t('overlay.cover')}</SelectItem>
                    <SelectItem value="contain">{t('overlay.contain')}</SelectItem>
                    <SelectItem value="stretch">{t('overlay.stretch')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.rotation')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {t('qr.nDegrees', { count: overlay.rotateDeg })}
                  </span>
                </div>
                <Slider
                  value={[overlay.rotateDeg]}
                  onValueChange={([v]) => setOverlayRotate(v)}
                  min={0}
                  max={360}
                  step={90}
                />
              </div>

              {/* Flip */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={overlay.flipX}
                    onCheckedChange={(checked) => setOverlayFlip({ x: checked })}
                  />
                  <Label className="text-sm">
                    <HighlightedLabel>{t('overlay.flipX')}</HighlightedLabel>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={overlay.flipY}
                    onCheckedChange={(checked) => setOverlayFlip({ y: checked })}
                  />
                  <Label className="text-sm">
                    <HighlightedLabel>{t('overlay.flipY')}</HighlightedLabel>
                  </Label>
                </div>
              </div>

              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    <HighlightedLabel>{t('overlay.brightness')}</HighlightedLabel>
                    <HelpLink anchor="filters" />
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.brightness}</span>
                </div>
                <Slider
                  value={[overlay.brightness]}
                  onValueChange={([v]) => setOverlayBrightness(v)}
                  min={-100}
                  max={100}
                  step={5}
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.contrast')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.contrast}</span>
                </div>
                <Slider
                  value={[overlay.contrast]}
                  onValueChange={([v]) => setOverlayContrast(v)}
                  min={-100}
                  max={100}
                  step={5}
                />
              </div>

              {/* Gamma */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.gamma')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.gamma.toFixed(1)}</span>
                </div>
                <Slider
                  value={[overlay.gamma]}
                  onValueChange={([v]) => setOverlayGamma(v)}
                  min={0.2}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.saturation')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.saturation}</span>
                </div>
                <Slider
                  value={[overlay.saturation]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, saturation: v } }))
                  }
                  min={-100}
                  max={100}
                  step={5}
                />
              </div>

              {/* Hue Rotate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.hueRotate')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {t('qr.nDegrees', { count: overlay.hueRotateDeg })}
                  </span>
                </div>
                <Slider
                  value={[overlay.hueRotateDeg]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, hueRotateDeg: v } }))
                  }
                  min={0}
                  max={360}
                  step={15}
                />
              </div>

              {/* Blur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.blur')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {t('qr.nPx', { count: overlay.blurPx })}
                  </span>
                </div>
                <Slider
                  value={[overlay.blurPx]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, blurPx: v } }))
                  }
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              {/* Sharpen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.sharpen')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.sharpen}</span>
                </div>
                <Slider
                  value={[overlay.sharpen]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, sharpen: v } }))
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Posterize */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.posterizeLevels')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {overlay.posterizeLevels || t('common.off')}
                  </span>
                </div>
                <Slider
                  value={[overlay.posterizeLevels]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, posterizeLevels: v } }))
                  }
                  min={0}
                  max={16}
                  step={1}
                />
              </div>

              {/* Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <HighlightedLabel>{t('overlay.threshold')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{overlay.threshold}</span>
                </div>
                <Slider
                  value={[overlay.threshold]}
                  onValueChange={([v]) =>
                    useQRStore.setState((s) => ({ overlay: { ...s.overlay, threshold: v } }))
                  }
                  min={0}
                  max={255}
                  step={1}
                />
              </div>

              {/* Edge Detect */}
              <div className="space-y-2">
                <Label>
                  <HighlightedLabel>{t('overlay.edge')}</HighlightedLabel>
                </Label>
                <Select
                  value={overlay.edgeDetect}
                  onValueChange={(v) =>
                    useQRStore.setState((s) => ({
                      overlay: { ...s.overlay, edgeDetect: v as typeof overlay.edgeDetect },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">{t('overlay.none')}</SelectItem>
                    <SelectItem value="sobel">{t('overlay.sobel')}</SelectItem>
                    <SelectItem value="canny">{t('overlay.canny')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dither Options */}
              {['dithered', 'blue-noise', 'dither', 'halftone-dithered'].includes(overlay.mode) && (
                <>
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-muted-foreground flex items-center gap-1.5">
                      <HighlightedLabel>{t('overlay.ditherSettings')}</HighlightedLabel>
                      <HelpLink anchor="dithering" />
                    </Label>
                    <Select
                      value={overlay.ditherKind}
                      onValueChange={(v) => setOverlayDitherKind(v as DitherKind)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error_diffusion">
                          {t('overlay.errorDiffusion')}
                        </SelectItem>
                        <SelectItem value="ordered_bayer">{t('overlay.orderedBayer')}</SelectItem>
                        <SelectItem value="ordered_clustered">
                          {t('overlay.clusteredDot')}
                        </SelectItem>
                        <SelectItem value="ordered_void_cluster">
                          {t('overlay.voidCluster')}
                        </SelectItem>
                        <SelectItem value="blue_noise">{t('overlay.blueNoise')}</SelectItem>
                        <SelectItem value="blue_noise_threshold">
                          {t('overlay.blueNoiseThreshold')}
                        </SelectItem>
                        <SelectItem value="white_noise">{t('overlay.whiteNoise')}</SelectItem>
                        <SelectItem value="gaussian_noise">{t('overlay.gaussianNoise')}</SelectItem>
                        <SelectItem value="triangular_noise">
                          {t('overlay.triangularNoise')}
                        </SelectItem>
                        <SelectItem value="true_dither">{t('overlay.trueDither')}</SelectItem>
                        <SelectItem value="blue_noise_error_diffusion">
                          {t('overlay.blueNoiseErrorDiffusion')}
                        </SelectItem>
                        <SelectItem value="screened_blue_noise">
                          {t('overlay.screenedBlueNoise')}
                        </SelectItem>
                        <SelectItem value="perceptual">{t('overlay.perceptual')}</SelectItem>
                        <SelectItem value="edge_aware">{t('overlay.edgeAware')}</SelectItem>
                        <SelectItem value="adaptive_threshold">
                          {t('overlay.adaptiveThreshold')}
                        </SelectItem>
                        <SelectItem value="temporal_blue_noise">
                          {t('overlay.temporalBlueNoise')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {overlay.ditherKind === 'error_diffusion' && (
                    <div className="space-y-2">
                      <Label>
                        <HighlightedLabel>{t('overlay.diffusionKernel')}</HighlightedLabel>
                      </Label>
                      <Select
                        value={overlay.diffusionKernel}
                        onValueChange={(v) => setOverlayDiffusionKernel(v as DiffusionKernel)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="floyd_steinberg">
                            {t('overlay.floydSteinberg')}
                          </SelectItem>
                          <SelectItem value="jarvis_judice_ninke">
                            {t('overlay.jarvisJudiceNinke')}
                          </SelectItem>
                          <SelectItem value="stucki">{t('overlay.stucki')}</SelectItem>
                          <SelectItem value="burkes">{t('overlay.burkes')}</SelectItem>
                          <SelectItem value="sierra">{t('overlay.sierra')}</SelectItem>
                          <SelectItem value="sierra_2">{t('overlay.sierra2')}</SelectItem>
                          <SelectItem value="sierra_lite">{t('overlay.sierraLite')}</SelectItem>
                          <SelectItem value="atkinson">{t('overlay.atkinson')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Dither Strength */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('overlay.ditherStrength')}</Label>
                      <span className="text-sm text-muted-foreground">
                        {t('qr.nPercent', { count: overlay.ditherStrength })}
                      </span>
                    </div>
                    <Slider
                      value={[overlay.ditherStrength]}
                      onValueChange={([v]) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, ditherStrength: v },
                        }))
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Serpentine */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('overlay.serpentineScanning')}</Label>
                    <Switch
                      checked={overlay.ditherSerpentine}
                      onCheckedChange={(checked) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, ditherSerpentine: checked },
                        }))
                      }
                    />
                  </div>

                  {/* Ordered Matrix */}
                  {overlay.ditherKind === 'true_dither' && (
                    <div className="space-y-2">
                      <Label className="text-sm">{t('overlay.orderedMatrix')}</Label>
                      <Select
                        value={overlay.orderedMatrix}
                        onValueChange={(v) =>
                          useQRStore.setState((s) => ({
                            overlay: { ...s.overlay, orderedMatrix: v as OrderedMatrix },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bayer2">{t('overlay.bayer2')}</SelectItem>
                          <SelectItem value="bayer4">{t('overlay.bayer4')}</SelectItem>
                          <SelectItem value="bayer8">{t('overlay.bayer8')}</SelectItem>
                          <SelectItem value="clustered_dot">{t('overlay.clusteredDot')}</SelectItem>
                          <SelectItem value="void_cluster">{t('overlay.voidCluster')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Blue Noise Settings */}
                  {overlay.ditherKind === 'blue_noise_threshold' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{t('overlay.tileSize')}</Label>
                          <span className="text-sm text-muted-foreground">
                            {overlay.blueNoiseTileSize}
                          </span>
                        </div>
                        <Slider
                          value={[overlay.blueNoiseTileSize]}
                          onValueChange={([v]) =>
                            useQRStore.setState((s) => ({
                              overlay: { ...s.overlay, blueNoiseTileSize: v },
                            }))
                          }
                          min={16}
                          max={256}
                          step={16}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">{t('overlay.seed')}</Label>
                        <Input
                          type="number"
                          value={overlay.blueNoiseSeed}
                          onChange={(e) =>
                            useQRStore.setState((s) => ({
                              overlay: {
                                ...s.overlay,
                                blueNoiseSeed: Number.parseInt(e.target.value, 10) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* Color Dither */}
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.colorDither')}</Label>
                    <Select
                      value={overlay.colorDither}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, colorDither: v as typeof overlay.colorDither },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('overlay.none')}</SelectItem>
                        <SelectItem value="per_channel">{t('overlay.perChannel')}</SelectItem>
                        <SelectItem value="perceptual">{t('overlay.perceptual')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* QR-First Mode Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label className="text-sm">
                      <HighlightedLabel>{t('overlay.qrFirstMode')}</HighlightedLabel>
                    </Label>
                    <Switch
                      checked={overlay.qrFirstMode}
                      onCheckedChange={(checked) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, qrFirstMode: checked },
                        }))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('overlay.qrFirstModeHelp')}</p>
                </>
              )}

              {/* Subpixel Settings */}
              {overlay.mode === 'subpixel' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-muted-foreground">{t('overlay.subpixelSettings')}</Label>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.gridSize')}</Label>
                    <Select
                      value={overlay.subpixelGridSize}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            subpixelGridSize: v as typeof overlay.subpixelGridSize,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x2">2×2</SelectItem>
                        <SelectItem value="3x3">3×3</SelectItem>
                        <SelectItem value="4x4">4×4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.centerRule')}</Label>
                    <Select
                      value={overlay.subpixelCenterRule}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            subpixelCenterRule: v as typeof overlay.subpixelCenterRule,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">{t('overlay.strict')}</SelectItem>
                        <SelectItem value="halftone_center">
                          {t('overlay.halftoneCenter')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.neutralColor')}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={overlay.subpixelNeutralColor}
                        onChange={(e) =>
                          useQRStore.setState((s) => ({
                            overlay: { ...s.overlay, subpixelNeutralColor: e.target.value },
                          }))
                        }
                        className="w-10 h-8 p-1"
                      />
                      <Input
                        type="text"
                        value={overlay.subpixelNeutralColor}
                        onChange={(e) =>
                          useQRStore.setState((s) => ({
                            overlay: { ...s.overlay, subpixelNeutralColor: e.target.value },
                          }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.finderOverride')}</Label>
                    <Select
                      value={overlay.subpixelFinderOverride}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            subpixelFinderOverride: v as typeof overlay.subpixelFinderOverride,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">{t('render.solid')}</SelectItem>
                        <SelectItem value="stylized">{t('overlay.stylized')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Halftone Settings */}
              {(overlay.mode === 'halftone' || overlay.mode === 'halftone-dithered') && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-muted-foreground">{t('overlay.halftoneSettings')}</Label>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.cellSize')}</Label>
                    <Select
                      value={overlay.halftoneCell}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, halftoneCell: v as typeof overlay.halftoneCell },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_module">{t('overlay.perModule')}</SelectItem>
                        <SelectItem value="n×n">{t('overlay.nxnGrid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.dotShape')}</Label>
                    <Select
                      value={overlay.halftoneDotShape}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            halftoneDotShape: v as typeof overlay.halftoneDotShape,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">{t('render.circle')}</SelectItem>
                        <SelectItem value="square">{t('render.square')}</SelectItem>
                        <SelectItem value="line">{t('overlay.line')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.brightnessCurve')}</Label>
                    <Select
                      value={overlay.brightnessCurve}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            brightnessCurve: v as typeof overlay.brightnessCurve,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">{t('render.linear')}</SelectItem>
                        <SelectItem value="s-curve">{t('overlay.sCurve')}</SelectItem>
                        <SelectItem value="gamma">{t('overlay.gamma')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Duotone Settings */}
              {overlay.mode === 'duotone' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-muted-foreground">{t('overlay.duotoneColors')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('overlay.shadow')}</Label>
                      <div className="flex gap-1">
                        <Input
                          type="color"
                          value={overlay.duotoneColors[0]}
                          onChange={(e) =>
                            useQRStore.setState((s) => ({
                              overlay: {
                                ...s.overlay,
                                duotoneColors: [e.target.value, s.overlay.duotoneColors[1]],
                              },
                            }))
                          }
                          className="w-8 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={overlay.duotoneColors[0]}
                          onChange={(e) =>
                            useQRStore.setState((s) => ({
                              overlay: {
                                ...s.overlay,
                                duotoneColors: [e.target.value, s.overlay.duotoneColors[1]],
                              },
                            }))
                          }
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {t('overlay.highlight')}
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          type="color"
                          value={overlay.duotoneColors[1]}
                          onChange={(e) =>
                            useQRStore.setState((s) => ({
                              overlay: {
                                ...s.overlay,
                                duotoneColors: [s.overlay.duotoneColors[0], e.target.value],
                              },
                            }))
                          }
                          className="w-8 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={overlay.duotoneColors[1]}
                          onChange={(e) =>
                            useQRStore.setState((s) => ({
                              overlay: {
                                ...s.overlay,
                                duotoneColors: [s.overlay.duotoneColors[0], e.target.value],
                              },
                            }))
                          }
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Artwork Mode Settings */}
              {overlay.mode === 'artwork' && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {t('overlay.artworkModeInfo')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        <HighlightedLabel>{t('overlay.searchIterations')}</HighlightedLabel>
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {overlay.qrartIterations.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={[overlay.qrartIterations]}
                      onValueChange={([v]) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, qrartIterations: v },
                        }))
                      }
                      min={1000}
                      max={100000}
                      step={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('overlay.searchIterationsHelp')}
                    </p>
                  </div>
                </div>
              )}

              {/* GIF Settings */}
              {overlay.type === 'gif' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-muted-foreground">{t('overlay.gifSettings')}</Label>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('overlay.useFrameDelays')}</Label>
                    <Switch
                      checked={overlay.gifUseFrameDelays}
                      onCheckedChange={(checked) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, gifUseFrameDelays: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('overlay.maxFps')}</Label>
                      <span className="text-sm text-muted-foreground">{overlay.gifMaxFps}</span>
                    </div>
                    <Slider
                      value={[overlay.gifMaxFps]}
                      onValueChange={([v]) =>
                        useQRStore.setState((s) => ({ overlay: { ...s.overlay, gifMaxFps: v } }))
                      }
                      min={1}
                      max={60}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('overlay.disposalHandling')}</Label>
                    <Select
                      value={overlay.gifDisposalHandling}
                      onValueChange={(v) =>
                        useQRStore.setState((s) => ({
                          overlay: {
                            ...s.overlay,
                            gifDisposalHandling: v as typeof overlay.gifDisposalHandling,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="respect">{t('overlay.respect')}</SelectItem>
                        <SelectItem value="simplify">{t('overlay.simplify')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Professional Options */}
          {tier === 'professional' && (
            <>
              {/* ECC Aware */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('overlay.eccAwareMode')}</Label>
                  <Switch
                    checked={overlay.eccAwareEnabled}
                    onCheckedChange={(checked) =>
                      useQRStore.setState((s) => ({
                        overlay: { ...s.overlay, eccAwareEnabled: checked },
                      }))
                    }
                  />
                </div>
                {overlay.eccAwareEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('overlay.riskBudget')}</Label>
                      <span className="text-sm text-muted-foreground">
                        {t('qr.nPercent', { count: overlay.eccAwareRiskBudget })}
                      </span>
                    </div>
                    <Slider
                      value={[overlay.eccAwareRiskBudget]}
                      onValueChange={([v]) =>
                        useQRStore.setState((s) => ({
                          overlay: { ...s.overlay, eccAwareRiskBudget: v },
                        }))
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
