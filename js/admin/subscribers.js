import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "subscribers";
const tbody = document.querySelector("[data-table-body]");
const exportBtn = document.querySelector("[data-export-btn]");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

let rows = [];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

async function loadRows() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="2">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  rows = data || [];
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2">No subscribers yet.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.email)}</td>
      <td>${escapeHtml(formatDate(row.subscribed_at))}</td>
    </tr>
  `).join("");
}

exportBtn.addEventListener("click", () => {
  if (rows.length === 0) return;
  const csv = ["email,subscribed_at", ...rows.map((r) => `${r.email},${r.subscribed_at}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "qt-training-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
});

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadRows();
})();
