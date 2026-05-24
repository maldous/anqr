import { FileText } from "lucide-react";
import i18n from "i18next";
import { parseVCardPayload } from "./payload-parsers";
import { appendVCardPhoneEntries } from "./append-v-card-phone-entries";
import { appendVCardEmailEntries } from "./append-v-card-email-entries";
import { appendVCardAddressEntries } from "./append-v-card-address-entries";
import { appendVCardExtras } from "./append-v-card-extras";
import type { DetailEntry } from "./detail-entry";

export function buildVCardDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const vcardData = parseVCardPayload(payload);

  if (vcardData.version) {
    details.push({
      label: i18n.t("analyze.vcardVersion", "vCard Version"),
      value: <span className="font-mono text-xs">v{vcardData.version}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.fullName) {
    details.push({
      label: i18n.t("analyze.fullName", "Full Name"),
      value: <span className="font-medium">{vcardData.fullName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.organization) {
    details.push({
      label: i18n.t("analyze.organization", "Organization"),
      value: vcardData.organization,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.title) {
    details.push({
      label: i18n.t("analyze.titleLabel", "Title"),
      value: vcardData.title,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  const phones = vcardData.phones as string[];
  if (phones && phones.length > 0) appendVCardPhoneEntries(details, phones);

  const emails = vcardData.emails as string[];
  if (emails && emails.length > 0) appendVCardEmailEntries(details, emails);

  const addresses = vcardData.addresses as string[];
  if (addresses && addresses.length > 0) appendVCardAddressEntries(details, addresses);

  appendVCardExtras(details, vcardData);
  return details;
}
