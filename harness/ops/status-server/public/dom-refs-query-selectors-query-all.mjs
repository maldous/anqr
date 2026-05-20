export const $$ = (selectors) => {
  return Array.from(document.querySelectorAll(selectors));
};