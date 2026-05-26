// Shared state for the status-server dashboard.
// All state and its setters live here so the various render-*.js
// modules can read+write through a single module instance.

export const API = "";

export const live = true;
export const searchQ = "";
export let activeTab = "services";
export let commitTypeFilter = "all";
export let allData = {};

export function setLive(v) {
  live = v;
}
export function setSearchQ(v) {
  searchQ = v;
}
export function setActiveTab(v) {
  activeTab = v;
}
export function setCommitTypeFilter(v) {
  commitTypeFilter = v;
}
export function setAllData(v) {
  allData = v;
}
