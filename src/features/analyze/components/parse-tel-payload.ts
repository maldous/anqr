// ---------------------------------------------------------------------------
// 5. Phone (tel:) parser with country detection
// ---------------------------------------------------------------------------
export function parseTelPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    number: null,
    formatted: null,
    countryCode: null,
    country: null,
    countryFlag: null,
  };

  let number = payload.toLowerCase().startsWith("tel:") ? payload.slice(4) : payload;
  number = number.replaceAll(/[^+\d]/g, "");
  result.number = number;
  result.formatted = number;

  // Detect country by dialing code
  const countryCodes: Record<string, { name: string; flag: string }> = {
    "+1": { name: "USA/Canada", flag: "🇺🇸" },
    "+44": { name: "United Kingdom", flag: "🇬🇧" },
    "+61": { name: "Australia", flag: "🇦🇺" },
    "+91": { name: "India", flag: "🇮🇳" },
    "+86": { name: "China", flag: "🇨🇳" },
    "+81": { name: "Japan", flag: "🇯🇵" },
    "+49": { name: "Germany", flag: "🇩🇪" },
    "+33": { name: "France", flag: "🇫🇷" },
    "+39": { name: "Italy", flag: "🇮🇹" },
    "+34": { name: "Spain", flag: "🇪🇸" },
    "+55": { name: "Brazil", flag: "🇧🇷" },
    "+52": { name: "Mexico", flag: "🇲🇽" },
    "+82": { name: "South Korea", flag: "🇰🇷" },
    "+7": { name: "Russia", flag: "🇷🇺" },
    "+31": { name: "Netherlands", flag: "🇳🇱" },
    "+46": { name: "Sweden", flag: "🇸🇪" },
    "+41": { name: "Switzerland", flag: "🇨🇭" },
    "+65": { name: "Singapore", flag: "🇸🇬" },
    "+64": { name: "New Zealand", flag: "🇳🇿" },
    "+353": { name: "Ireland", flag: "🇮🇪" },
    "+972": { name: "Israel", flag: "🇮🇱" },
    "+971": { name: "UAE", flag: "🇦🇪" },
    "+966": { name: "Saudi Arabia", flag: "🇸🇦" },
    "+27": { name: "South Africa", flag: "🇿🇦" },
    "+62": { name: "Indonesia", flag: "🇮🇩" },
    "+60": { name: "Malaysia", flag: "🇲🇾" },
    "+63": { name: "Philippines", flag: "🇵🇭" },
    "+66": { name: "Thailand", flag: "🇹🇭" },
    "+84": { name: "Vietnam", flag: "🇻🇳" },
  };

  if (number.startsWith("+")) {
    // Try to match longest prefix first
    for (const prefix of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
      if (number.startsWith(prefix)) {
        result.countryCode = prefix;
        result.country = countryCodes[prefix].name;
        result.countryFlag = countryCodes[prefix].flag;
        break;
      }
    }
  }

  return result;
}
