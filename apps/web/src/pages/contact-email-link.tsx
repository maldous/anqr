import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../packages/ui/web/src/primitives/button";

export function ContactEmailLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t("contact.emailUs")}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t("contact.emailUsDesc")}</p>
      <Button asChild size="lg">
        <a href="mailto:email@anqr.link">
          <Mail className="h-4 w-4 mr-2" />
          email@anqr.link
        </a>
      </Button>
    </div>
  );
}
