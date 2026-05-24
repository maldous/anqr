import { setAllData, searchQ } from "./state.js";
import { renderStats } from "./render-stats.js";
import { renderServices } from "./render-services.js";
import { renderCommits } from "./render-commits.js";
import { renderIssues } from "./render-issues.js";
import { renderModels } from "./render-models.js";
import { renderSymphony } from "./render-symphony.js";

export function renderAll(data) {
  setAllData(data);
  window.searchQ = searchQ;
  renderStats(data);
  renderServices(data.health?.services);
  renderCommits(data.commits);
  renderIssues(data.issues);
  renderModels(data.models);
  renderSymphony(data.symphony);
  if (typeof window.renderBookmarks === "function") window.renderBookmarks();
}
