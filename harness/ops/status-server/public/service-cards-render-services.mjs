export function renderServices(data) {
  els.servicesList.innerHTML = "";
  const filtered = currentFilter === "all"
    ? data.services
    : data.services.filter((s) => s.status === currentFilter);

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "loading";
    empty.textContent = `No ${currentFilter} services`;
    els.servicesList.appendChild(empty);
    return;
  }

  for (const svc of filtered) {
    els.servicesList.appendChild(createServiceCard(svc));
  }
}