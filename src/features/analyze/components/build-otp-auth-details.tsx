import { FileText, Hash, Lock, Settings, Shield } from 'lucide-react';
import { parseOtpAuthPayload } from './payload-parsers';
import { appendOtpTimingEntries } from './append-otp-timing-entries';
import type { DetailEntry } from './detail-entry';

export function buildOtpAuthDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const otpData = parseOtpAuthPayload(payload);

  if (otpData.type) {
    details.push({
      label: 'Type',
      value: (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            otpData.type === 'TOTP'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}
        >
          {otpData.type === 'TOTP' ? 'Time-based OTP' : 'Counter-based OTP'}
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }

  if (otpData.issuer) {
    details.push({
      label: 'Issuer',
      value: <span className="font-medium">{otpData.issuer}</span>,
      icon: <Shield className="w-3 h-3" />,
    });
  }

  if (otpData.account) {
    details.push({
      label: 'Account',
      value: <span className="font-mono text-xs">{otpData.account}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  if (otpData.algorithm) {
    details.push({
      label: 'Algorithm',
      value: (
        <div className="text-right">
          <span className="font-mono text-xs">{otpData.algorithm}</span>
          {otpData.algorithmNote && (
            <div className="text-[10px] text-muted-foreground">{otpData.algorithmNote}</div>
          )}
        </div>
      ),
      icon: <Settings className="w-3 h-3" />,
    });
  }

  if (otpData.digits) {
    details.push({
      label: 'Code Length',
      value: `${otpData.digits} digits`,
      icon: <Hash className="w-3 h-3" />,
    });
  }

  appendOtpTimingEntries(details, otpData);
  return details;
}
