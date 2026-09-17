import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "courses";
const tbody = document.querySelector("[data-table-body]");
const panel = document.querySelector("[data-form-panel]");
const form = panel;
const addBtn = document.querySelector("[data-add-btn]");
const cancelBtn = document.querySelector("[data-cancel-btn]");
const status = document.querySelector("[data-form-status]");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function openPanel() {
  panel.classList.add("open");
}
function closePanel() {
  panel.classList.remove("open");
  form.reset();
  form.id.value = "";
  status.textContent = "";
  status.className = "form-status";
}

addBtn.addEventListener("click", () => {
  form.reset();
  form.id.value = "";
  openPanel();
});
cancelBtn.addEventListener("click", closePanel);

async function loadRows() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No courses yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row) => `
    <tr data-row="${row.id}">
      <td>${escapeHtml(row.category)}</td>
      <td>${escapeHtml(row.title)}</td>
      <td>${escapeHtml(row.code)}</td>
      <td>${escapeHtml(row.nqf_level)}</td>
      <td>${escapeHtml(row.credits)}</td>
      <td class="actions">
        <button class="btn btn-outline on-light btn-sm" data-edit-btn>Edit</button>
        <button class="btn btn-danger btn-sm" data-delete-btn>Delete</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-edit-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.row;
      const row = data.find((r) => String(r.id) === String(id));
      if (!row) return;
      form.id.value = row.id;
      form.category.value = row.category || "";
      form.title.value = row.title || "";
      form.code.value = row.code || "";
      form.nqf_level.value = row.nqf_level ?? "";
      form.credits.value = row.credits ?? "";
      form.sort_order.value = row.sort_order ?? 0;
      form.description.value = row.description || "";
      openPanel();
    });
  });

  tbody.querySelectorAll("[data-delete-btn]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.dataset.confirming !== "true") {
        btn.dataset.confirming = "true";
        const original = btn.textContent;
        btn.textContent = "Confirm?";
        setTimeout(() => {
          if (btn.dataset.confirming === "true") {
            btn.dataset.confirming = "false";
            btn.textContent = original;
          }
        }, 3000);
        return;
      }
      const id = btn.closest("tr").dataset.row;
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) {
        alert_fallback(error.message);
        return;
      }
      loadRows();
    });
  });
}

function alert_fallback(msg) {
  status.textContent = "Error: " + msg;
  status.classList.add("error");
  openPanel();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className = "form-status";

  const payload = {
    category: form.category.value.trim(),
    title: form.title.value.trim(),
    code: form.code.value.trim(),
    nqf_level: Number(form.nqf_level.value),
    credits: Number(form.credits.value),
    sort_order: Number(form.sort_order.value) || 0,
    description: form.description.value.trim() || null,
  };

  const id = form.id.value;
  const query = id
    ? supabase.from(TABLE).update(payload).eq("id", id)
    : supabase.from(TABLE).insert(payload);

  const { error } = await query;

  if (error) {
    status.textContent = "Error: " + error.message;
    status.classList.add("error");
    return;
  }

  closePanel();
  loadRows();
});

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadRows();
})();
