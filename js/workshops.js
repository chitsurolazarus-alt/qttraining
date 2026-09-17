import { supabase } from "./supabase-client.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function renderGroups(workshops) {
  const wrap = document.querySelector("[data-workshop-groups]");
  if (!wrap) return;

  if (!workshops || workshops.length === 0) {
    wrap.innerHTML = '<p class="empty-state">Workshop listings are being updated. Please check back soon, or contact us directly.</p>';
    return;
  }

  const byCategory = new Map();
  workshops.forEach((w) => {
    if (!byCategory.has(w.category)) byCategory.set(w.category, []);
    byCategory.get(w.category).push(w);
  });

  let html = "";
  byCategory.forEach((items, category) => {
    html += `<div class="workshop-group">
      <h3>${escapeHtml(category)}</h3>
      ${items.map((w) => `
        <div class="workshop-card">
          <h4>${escapeHtml(w.title)}</h4>
          ${w.subtitle ? `<div class="subtitle">${escapeHtml(w.subtitle)}</div>` : ""}
          ${w.description ? `<p>${escapeHtml(w.description)}</p>` : ""}
        </div>
      `).join("")}
    </div>`;
  });

  wrap.innerHTML = html;
}

async function loadWorkshops() {
  const { data, error } = await supabase
    .from("workshops")
    .select("category, title, subtitle, description, sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    renderGroups([]);
    return;
  }
  renderGroups(data);
}

loadWorkshops();
