export function filterChangedFiles(changedFiles, regex) {
  return (changedFiles || []).filter((file) => regex.test(file));
}
