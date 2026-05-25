import { Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import type React from "react";
import type { useTranslation } from "react-i18next";

// File-upload card with real drag-and-drop support (D-F7). Earlier the
// hint text claimed "Click or drop" but the surrounding <label> had no
// drag handlers — drops did nothing. Now they do.
export function FileUploadCard({
  t,
  isLoading,
  isLoadingFile,
  handleFileUpload,
}: Readonly<{
  t: ReturnType<typeof useTranslation>["t"];
  isLoading: boolean;
  isLoadingFile: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragOver(true);
  }, [isLoading]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (isLoading) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      // Synthesize a ChangeEvent shape with the dropped FileList so the
      // existing handleFileUpload callback works unchanged.
      const synthetic = {
        target: { files: e.dataTransfer.files, value: "" },
        currentTarget: { files: e.dataTransfer.files, value: "" },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(synthetic);
    },
    [handleFileUpload, isLoading],
  );

  const active = isLoadingFile || isDragOver;

  return (
    <label
      className="relative group cursor-pointer"
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isLoading}
      />
      <div
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all h-full shadow-sm ${
          active
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-primary/5"
        }`}
      >
        {isLoadingFile ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">{t("analyze.uploadFile", "Upload")}</p>
          <p className="text-[10px] text-muted-foreground">
            {t("analyze.uploadHint", "Click or drop")}
          </p>
        </div>
      </div>
    </label>
  );
}
