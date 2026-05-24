import {
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Hash,
  MessageSquare,
  Wallet,
} from "lucide-react";
import i18n from "i18next";
import { parseCryptoPayload } from "./payload-parsers";
import { CopyButton } from "./copy-button";
import type { DetailEntry } from "./detail-entry";

export function buildCryptoDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const cryptoData = parseCryptoPayload(payload);

  if (cryptoData.network) {
    const networkColors: Record<string, string> = {
      Bitcoin: "bg-orange-500 text-white",
      Ethereum: "bg-purple-500 text-white",
      Litecoin: "bg-gray-500 text-white",
      Dogecoin: "bg-yellow-500 text-black",
    };
    const colorClass = networkColors[String(cryptoData.network)] || "bg-muted text-foreground";
    details.push({
      label: i18n.t("analyze.network", "Network"),
      value: (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {cryptoData.network}
        </span>
      ),
      icon: <Wallet className="w-3 h-3" />,
    });
  }

  if (cryptoData.addressPreview) {
    details.push({
      label: i18n.t("analyze.streetAddress", "Address"),
      value: <span className="font-mono text-xs">{cryptoData.addressPreview}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (cryptoData.address) {
    details.push({
      label: i18n.t("analyze.fullAddress", "Full Address"),
      value: (
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] break-all max-w-[150px]">
            {cryptoData.address}
          </span>
          <CopyButton text={String(cryptoData.address)} />
        </div>
      ),
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (cryptoData.amount) {
    details.push({
      label: i18n.t("analyze.amount", "Amount"),
      value: (
        <span className="font-mono text-sm font-bold">
          {cryptoData.amount} {cryptoData.network}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (cryptoData.label) {
    details.push({
      label: i18n.t("analyze.labelField", "Label"),
      value: cryptoData.label,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (cryptoData.message) {
    details.push({
      label: i18n.t("analyze.message", "Message"),
      value: <span className="text-xs">{cryptoData.message}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (cryptoData.explorerUrl) {
    details.push({
      label: i18n.t("analyze.blockExplorer", "Block Explorer"),
      value: (
        <a
          href={String(cryptoData.explorerUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {i18n.t("analyze.viewOnBlockchain", "View on blockchain")} <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  return details;
}
