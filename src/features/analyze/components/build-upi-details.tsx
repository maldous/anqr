import {
  CreditCard,
  FileText,
  Hash,
  MessageSquare,
  Settings,
  Smartphone,
} from 'lucide-react';
import { parseUpiPayload } from './payload-parsers';
import type { DetailEntry } from './detail-entry';

export function buildUpiDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const upiData = parseUpiPayload(payload);

  details.push({
    label: 'Payment Standard',
    value: (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
        UPI (India)
      </span>
    ),
    icon: <Smartphone className="w-3 h-3" />,
  });

  if (upiData.vpa) {
    details.push({
      label: 'UPI ID (VPA)',
      value: <span className="font-mono text-xs font-medium">{upiData.vpa}</span>,
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (upiData.payeeName) {
    details.push({
      label: 'Payee Name',
      value: <span className="font-medium">{upiData.payeeName}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (upiData.amount) {
    details.push({
      label: 'Amount',
      value: (
        <span className="font-mono text-sm font-bold">
          {upiData.currency || 'INR'} {upiData.amount}
        </span>
      ),
      icon: <CreditCard className="w-3 h-3" />,
    });
  }

  if (upiData.transactionRef) {
    details.push({
      label: 'Transaction Ref',
      value: <span className="font-mono text-xs">{upiData.transactionRef}</span>,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  if (upiData.transactionNote) {
    details.push({
      label: 'Note',
      value: <span className="text-xs">{upiData.transactionNote}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (upiData.merchantCode) {
    details.push({
      label: 'Merchant Code',
      value: <span className="font-mono text-xs">{upiData.merchantCode}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  return details;
}
