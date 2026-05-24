import { API } from "./state.js";

export async function fetchAll() {
  const res = await fetch(`${API}/api/all`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
