import { ChevronRight, Link, Loader2 } from "lucide-react";
import type { useTranslation } from "react-i18next";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";

export function UrlInputCard({
  t,
  isLoading,
  isLoadingUrl,
  urlInput,
  setUrlInput,
  handleUrlSubmit,
}: Readonly<{
  t: ReturnType<typeof useTranslation>["t"];
  isLoading: boolean;
  isLoadingUrl: boolean;
  urlInput: string;
  setUrlInput: (v: string) => void;
  handleUrlSubmit: () => void;
}>) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingUrl ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Link className="w-4 h-4" />
        <span className="text-sm font-medium">{t("analyze.fromUrl", "From URL")}</span>
      </div>
      <div className="flex gap-1.5">
        <Input
          type="url"
          placeholder="https://..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          disabled={isLoading}
          className="flex-1 h-8 text-xs"
        />
        <Button
          size="sm"
          onClick={handleUrlSubmit}
          disabled={isLoading || !urlInput.trim()}
          className="h-8 w-8 p-0"
        >
          {isLoadingUrl ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
