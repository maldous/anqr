export interface OverlaySourceActionsDeps {
  setOverlayEnabled: (v: boolean) => void;
  setOverlayFile: (v: File | null) => void;
  setOverlayUrl: (v: string) => void;
  setOverlayCrop: (v: {
    enabled?: boolean;
    region?: { x: number; y: number; size: number };
  }) => void;
  setPreviewImageSize: (v: { width: number; height: number } | null) => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  setUrlError: (v: string | null) => void;
  setIsLoadingUrl: (v: boolean) => void;
  setShowUrlInput: (v: boolean) => void;
  setCameraError: (v: string | null) => void;
  setCameraLoading: (v: boolean) => void;
  setGalleryLoading: (v: boolean) => void;
  setShowGalleryPicker: (v: boolean) => void;
  t: (key: string) => string;
}
