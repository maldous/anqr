export const API = "";
export let live = true;
export let searchQ = "";
export let activeTab = "services";
export let serviceFilter = "all";
export let commitTypeFilter = "all";
export let allData = {};

export function setLive(value) { live = value; }
export function setSearchQ(value) { searchQ = value; }
export function setActiveTab(value) { activeTab = value; }
export function setServiceFilter(value) { serviceFilter = value; }
export function setCommitTypeFilter(value) { commitTypeFilter = value; }
export function setAllData(value) { allData = value; }
