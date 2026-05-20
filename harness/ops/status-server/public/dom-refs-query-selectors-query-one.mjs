// Re-export the `$` helper that queries a single element.
// Previously this file incorrectly imported itself, causing a circular
// dependency and a Sonar `Module imports itself` issue (S7060).
export { $ } from "./dom-refs-query-selectors-query.mjs";