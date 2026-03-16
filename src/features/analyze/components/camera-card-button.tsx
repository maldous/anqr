import { Camera as CameraIcon, Loader2 } from "lucide-react";
import type { useTranslation } from "react-i18next";

export function CameraCardButton({
  t,
  isLoading,
  isLoadingCamera,
  handleCameraCapture,
}: Readonly<{
  t: ReturnType<typeof useTranslation>["t"];
  isLoading: boolean;
  isLoadingCamera: boolean;
  handleCameraCapture: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={handleCameraCapture}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingCamera
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary hover:bg-primary/5"
      }`}
    >
      {isLoadingCamera ? (
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      ) : (
        <CameraIcon className="w-6 h-6 text-muted-foreground" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium">{t("analyze.captureCamera", "Photo")}</p>
        <p className="text-[10px] text-muted-foreground">{t("analyze.cameraHint", "Camera")}</p>
      </div>
    </button>
  );
}
