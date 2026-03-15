import { Eye, FileText, Info, Lock, Settings, Shield, Wifi } from 'lucide-react';
import { parseWifiPayload } from './payload-parsers';
import { buildWifiSecurityBadge } from './build-wifi-security-badge';
import type { DetailEntry } from './detail-entry';

export function buildWifiDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const wifiData = parseWifiPayload(payload);

  if (wifiData.ssid) {
    details.push({
      label: 'Network Name (SSID)',
      value: <span className="font-mono text-xs font-medium">{wifiData.ssid}</span>,
      icon: <Wifi className="w-3 h-3" />,
    });
  }

  if (wifiData.security) {
    const sec = String(wifiData.security).toUpperCase();
    const { badge: securityBadge, note: securityNote } = buildWifiSecurityBadge(sec);

    details.push({
      label: 'Security Type',
      value: securityBadge ?? <span className="font-mono text-xs">{wifiData.security}</span>,
      icon: <Shield className="w-3 h-3" />,
    });

    if (securityNote) {
      details.push({
        label: 'Security Note',
        value: <span className="text-xs text-muted-foreground">{securityNote}</span>,
        icon: <Info className="w-3 h-3" />,
      });
    }
  }

  if (wifiData.password) {
    const pwd = String(wifiData.password);
    details.push({
      label: 'Password',
      value: (
        <span className="font-mono text-xs">
          {'•'.repeat(Math.min(pwd.length, 12))}
          <span className="text-muted-foreground ml-1">({pwd.length} chars)</span>
        </span>
      ),
      icon: <Lock className="w-3 h-3" />,
    });
  }

  details.push({
    label: 'Hidden Network',
    value:
      wifiData.hidden === 'true' ? (
        <span className="text-amber-600 dark:text-amber-400">Yes (won't appear in scan)</span>
      ) : (
        <span className="text-green-600 dark:text-green-400">No (visible)</span>
      ),
    icon: <Eye className="w-3 h-3" />,
  });

  if (wifiData.eapMethod) {
    details.push({
      label: 'EAP Method',
      value: <span className="font-mono text-xs">{wifiData.eapMethod}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  if (wifiData.identity) {
    details.push({
      label: 'Identity',
      value: <span className="font-mono text-xs">{wifiData.identity}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (wifiData.phase2) {
    details.push({
      label: 'Phase 2',
      value: <span className="font-mono text-xs">{wifiData.phase2}</span>,
      icon: <Settings className="w-3 h-3" />,
    });
  }
  return details;
}
