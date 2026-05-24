import { CreditCard, FileText, Hash, Settings } from "lucide-react";
import i18n from "i18next";
import { parseEpcSepaPayload } from "./payload-parsers";
import { CopyButton } from "./copy-button";
import type { DetailEntry } from "./detail-entry";

export function buildEpcSepaDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const epcData = parseEpcSepaPayload(payload);

  details.push({
    label: i18n.t("analyze.paymentStandard", "Payment Standard"),
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
        {i18n.t("analyze.epcSepaCreditTransfer", "EPC/SEPA Credit Transfer")}
      </span>
    ),
    icon: <CreditCard className="w-3 h-3" />,
  });

  if (epcData.serviceTag) {
    details.push({
      label: i18n.t("analyze.serviceTag", "Service Tag"),
      value: <span className="font-mono text-xs">{epcData.serviceTag}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (epcData.version) {
    details.push({
      label: i18n.t("analyze.version", "Version"),
      value: <span className="font-mono text-xs">{epcData.version}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (epcData.beneficiaryName) {
    details.push({
      label: i18n.t("analyze.beneficiary", "Beneficiary"),
      value: <span className="font-medium">{epcData.beneficiaryName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (epcData.iban) {
    details.push({
      label: i18n.t("analyze.iban", "IBAN"),
      value: (
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs">{epcData.iban}</span>
          <CopyButton text={String(epcData.iban).replaceAll(/\s/g, "")} />
        </div>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.bic) {
    details.push({
      label: i18n.t("analyze.bicSwift", "BIC/SWIFT"),
      value: <span className="font-mono text-xs">{epcData.bic}</span>,
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.amount) {
    details.push({
      label: i18n.t("analyze.amount", "Amount"),
      value: (
        <span className="font-mono text-sm font-bold">
          {epcData.currency || "EUR"} {epcData.amount}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (epcData.referenceType) {
    details.push({
      label: i18n.t("analyze.referenceType", "Reference Type"),
      value: <span className="font-mono text-xs">{epcData.referenceType}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }
  if (epcData.reference) {
    details.push({
      label: i18n.t("analyze.reference", "Reference"),
      value: <span className="font-mono text-xs">{epcData.reference}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (epcData.remittanceInfo) {
    details.push({
      label: i18n.t("analyze.remittanceInfo", "Remittance Info"),
      value: <span className="text-xs">{epcData.remittanceInfo}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}
