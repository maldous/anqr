export const toKebab = (value) =>
  value
    .replaceAll(/([a-z\d])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z]+?)([A-Z][a-z])/g, "$1-$2")
    .replaceAll(/[_.\s]+/g, "-")
    .replaceAll(/--+/g, "-")
    .replaceAll(/(?:^-+)|(?:-+$)/g, "")
    .toLowerCase();
