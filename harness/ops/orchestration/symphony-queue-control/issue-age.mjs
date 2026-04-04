export function issueAge(issue, field) {
  return Date.now() - new Date(issue[field]).getTime();
}
