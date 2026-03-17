import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isRtlLanguage, languages } from "../../i18n";
import { Button } from "@/ui/primitives/button";

export function HeaderLanguageMenu({
  langMenuOpen,
  isLangMenuClosing,
  langButtonRef,
  currentLang,
  onToggle,
  onClose,
  onChangeLanguage,
  onCloseAnimationEnd,
}: Readonly<{
  langMenuOpen: boolean;
  isLangMenuClosing: boolean;
  langButtonRef: React.RefObject<HTMLDivElement | null>;
  currentLang: (typeof languages)[number];
  onToggle: () => void;
  onClose: () => void;
  onChangeLanguage: (code: string) => void;
  onCloseAnimationEnd: () => void;
}>) {
  const { t, i18n } = useTranslation();
  return (
    <div className="relative" ref={langButtonRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-9 w-9"
        title={`${t("language.select")}: ${currentLang.name}`}
        aria-label={`${currentLang.name} - ${t("language.select", "Select language")}`}
        aria-expanded={langMenuOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden="true">
          {currentLang.flag}
        </span>
        <span className="sr-only">{currentLang.name}</span>
      </Button>
      {(langMenuOpen || isLangMenuClosing) && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-default bg-transparent border-none"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
            aria-label={t("common.close", "Close language menu")}
            tabIndex={-1}
          />
          <div
            className={`fixed w-72 bg-card border rounded-lg shadow-lg z-[70] py-1 max-h-[50vh] overflow-y-auto origin-top ${isLangMenuClosing ? "animate-[dropdown-close_0.15s_ease-in_forwards]" : "animate-[dropdown_0.2s_ease-out]"}`}
            style={{
              top: langButtonRef.current
                ? langButtonRef.current.getBoundingClientRect().bottom + 4
                : 0,
              ...(isRtlLanguage(i18n.language) ? { left: 8 } : { right: 8 }),
            }}
            onAnimationEnd={() => {
              if (isLangMenuClosing) onCloseAnimationEnd();
            }}
            aria-label={t("language.select", "Select language")}
          >
            {[...languages]
              .sort((a, b) => {
                const currentCode = i18n.language.split("-")[0];
                const aIsCurrent = a.code === currentCode || a.code === i18n.language;
                const bIsCurrent = b.code === currentCode || b.code === i18n.language;
                if (aIsCurrent && !bIsCurrent) return -1;
                if (bIsCurrent && !aIsCurrent) return 1;
                return t(`languages.${a.code}`).localeCompare(
                  t(`languages.${b.code}`),
                  i18n.language,
                );
              })
              .map((lang) => {
                const isCurrent =
                  i18n.language === lang.code || i18n.language.startsWith(lang.code);
                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => onChangeLanguage(lang.code)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 ${isCurrent ? "bg-muted" : ""}`}
                    title={`${lang.nativeName} - ${t("languages." + lang.code)}`}
                    aria-label={`${lang.nativeName} (${lang.name})`}
                    aria-current={isCurrent ? "true" : undefined}
                  >
                    <span>{lang.flag}</span>
                    <span>
                      {lang.nativeName}
                      {!isCurrent && ` (${t("languages." + lang.code)})`}
                      {isCurrent && lang.code !== "en-GB" && ` (${lang.name})`}
                    </span>
                    {isCurrent && <Check className="h-4 w-4 ml-auto" aria-hidden="true" />}
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
