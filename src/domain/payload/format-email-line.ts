export function formatEmailLine(email: string, version: string): string {
  if (version === '4.0') {
    return `EMAIL:${email}`;
  } else if (version === '2.1') {
    // vCard 2.1: use INTERNET without TYPE=
    return `EMAIL;INTERNET:${email}`;
  } else {
    return `EMAIL;TYPE=INTERNET:${email}`;
  }
}
