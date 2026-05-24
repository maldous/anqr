import { useCallback, useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/web";

export const CopyButton = ({
  text,
  label,
  className = "",
}: Readonly<{
  text: string;
  label?: string;
  className?: string;
}>) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-7 gap-1.5 text-xs ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-500">{t("common.copied", "Copied!")}</span>
        </>
      ) : (
        <>
          <ClipboardCopy className="w-3 h-3" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
};
