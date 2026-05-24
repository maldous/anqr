import { FileText, Globe, Mail } from "lucide-react";
import i18n from "i18next";
import { parseEmailPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildEmailDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const emailData = parseEmailPayload(payload);

  if (emailData.provider) {
    const providerColors: Record<string, string> = {
      Gmail: "bg-red-500/10 text-red-600 dark:text-red-400",
      "Microsoft Outlook": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      "Yahoo Mail": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      "Apple iCloud": "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      ProtonMail: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };
    const colorClass = providerColors[String(emailData.provider)] || "bg-muted text-foreground";
    details.push({
      label: i18n.t("analyze.emailProvider", "Email Provider"),
      value: (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {emailData.provider}
        </span>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }

  if (emailData.to) {
    details.push({
      label: i18n.t("analyze.recipient", "Recipient"),
      value: (
        <a
          href={`mailto:${emailData.to}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {emailData.to}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }

  if (emailData.domain) {
    details.push({
      label: i18n.t("analyze.domain", "Domain"),
      value: <span className="font-mono text-xs">{emailData.domain}</span>,
      icon: <Globe className="w-3 h-3" />,
    });
  }

  if (emailData.subject) {
    details.push({
      label: i18n.t("analyze.subject", "Subject"),
      value: <span className="text-xs font-medium">{emailData.subject}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (emailData.body) {
    details.push({
      label: i18n.t("analyze.bodyPreview", "Body Preview"),
      value: (
        <span className="text-xs text-muted-foreground">
          {String(emailData.body).slice(0, 80)}
          {String(emailData.body).length > 80 ? "..." : ""}
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (emailData.cc) {
    details.push({
      label: i18n.t("analyze.cc", "CC"),
      value: <span className="font-mono text-xs">{emailData.cc}</span>,
      icon: <Mail className="w-3 h-3" />,
    });
  }
  if (emailData.bcc) {
    details.push({
      label: i18n.t("analyze.bcc", "BCC"),
      value: <span className="font-mono text-xs">{emailData.bcc}</span>,
      icon: <Mail className="w-3 h-3" />,
    });
  }
  return details;
}
