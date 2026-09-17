import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "enquiries";
const tbody = document.querySelector("[data-table-body]");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

async function loadRows() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No enquiries yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row) => `
    <tr data-row="${row.id}">
      <td>${escapeHtml(formatDate(row.submitted_at))}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.email)}${row.phone ? "<br>" + escapeHtml(row.phone) : ""}</td>
      <td style="max-width:280px;">${escapeHtml(row.message)}</td>
      <td><span class="badge ${row.is_read ? "yes" : "no"}">${row.is_read ? "Read" : "Unread"}</span></td>
      <td class="actions">
        <button class="btn btn-outline on-light btn-sm" data-toggle-btn>${row.is_read ? "Mark Unread" : "Mark Read"}</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-toggle-btn]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("tr").dataset.row;
      const row = data.find((r) => String(r.id) === String(id));
      if (!row) return;
      const { error } = await supabase.from(TABLE).update({ is_read: !row.is_read }).eq("id", id);
      if (!error) loadRows();
    });
  });
}

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadRows();
})();
