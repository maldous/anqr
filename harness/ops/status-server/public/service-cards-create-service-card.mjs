export function createServiceCard(service) {
  const detailStr = service.data
    ? JSON.stringify(service.data, null, 2)
    : service.error || "(no response)";

  let serviceMeta;
  if (service.statusCode) {
    serviceMeta = `HTTP ${service.statusCode}`;
  } else if (service.error) {
    serviceMeta = "Connection failed";
  } else {
    serviceMeta = "—";
  }

  const card = document.createElement("div");
  card.className = `service-card ${currentFilter !== "all" && service.status !== currentFilter ? "hidden" : ""}`;
  card.dataset.status = service.status;
  card.dataset.id = service.id;

  card.innerHTML = `
    <div class="service-left">
      <div class="service-indicator ${service.status}"></div>
      <div class="service-info">
        <div class="service-name">${service.name}</div>
        <div class="service-meta">${serviceMeta}</div>
      </div>
    </div>
    <div class="service-right">
      <span class="service-badge ${service.status}${service.critical ? " critical" : ""}">
        ${service.status}${service.critical ? " ★" : ""}
      </span>
      <button class="service-detail-toggle" title="Toggle details" aria-label="Toggle details">▸</button>
    </div>
  `;

  // Detail panel (hidden by default)
  const detail = document.createElement("div");
  detail.className = "service-detail";
  detail.textContent = detailStr;

  const toggle = card.querySelector(".service-detail-toggle");
  toggle.addEventListener("click", () => {
    const isOpen = detail.classList.toggle("visible");
    toggle.classList.toggle("open", isOpen);
    toggle.textContent = isOpen ? "▾" : "▸";
  });

  const wrapper = document.createElement("div");
  wrapper.appendChild(card);
  wrapper.appendChild(detail);

  return wrapper;
}