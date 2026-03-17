import { isValidEmail } from "@/modules/payload-generators/utils";
import { formatEmailLine } from "./format-email-line";

export function appendValidEmailLines(lines: string[], emails: string[], version: string): void {
  for (const email of emails) {
    if (isValidEmail(email)) {
      lines.push(formatEmailLine(email, version));
    }
  }
}
