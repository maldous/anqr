import { Loader2, QrCode } from "lucide-react";
import type { useTranslation } from "react-i18next";

export function GeneratorCardActive({
  t,
  isLoadingGenerator,
  handleAnalyzeGenerator,
  isLoading,
}: Readonly<{
  t: ReturnType<typeof useTranslation>["t"];
  isLoadingGenerator: boolean;
  handleAnalyzeGenerator: () => void;
  isLoading: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={handleAnalyzeGenerator}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingGenerator
          ? "border-primary bg-primary/5"
          : "border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10"
      }`}
    >
      {isLoadingGenerator ? (
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      ) : (
        <QrCode className="w-6 h-6 text-primary" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-primary">
          {t("analyze.useCurrentQr", "Current QR")}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {t("analyze.fromGenerator", "From Generator")}
        </p>
      </div>
    </button>
  );
}
