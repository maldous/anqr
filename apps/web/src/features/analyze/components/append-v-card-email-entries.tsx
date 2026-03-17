import { Mail } from "lucide-react";
import type { DetailEntry } from "./detail-entry";

export function appendVCardEmailEntries(details: DetailEntry[], emails: string[]): void {
  for (const email of emails) {
    const [type, address] = email.includes(":") ? email.split(": ") : ["Email", email];
    details.push({
      label: type,
      value: (
        <a href={`mailto:${address}`} className="font-mono text-xs text-primary hover:underline">
          {address}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }
}
