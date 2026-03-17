import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/primitives/button";
import { REDDIT_URL } from "./reddit-url.const";

export function ContactRedditLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t("contact.redditCommunity")}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t("contact.redditCommunityDesc")}</p>
      <Button asChild size="lg">
        <a href={REDDIT_URL} target="_blank" rel="noopener noreferrer">
          <Users className="h-4 w-4 mr-2" />
          {t("contact.joinReddit")}
        </a>
      </Button>
    </div>
  );
}
