import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "workshops";
const tbody = document.querySelector("[data-table-body]");
const form = document.querySelector("[data-form-panel]");
const addBtn = document.querySelector("[data-add-btn]");
const cancelBtn = document.querySelector("[data-cancel-btn]");
const status = document.querySelector("[data-form-status]");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function openPanel() { form.classList.add("open"); }
function closePanel() {
  form.classList.remove("open");
  form.reset();
  form.id.value = "";
  status.textContent = "";
  status.className = "form-status";
}

addBtn.addEventListener("click", () => { form.reset(); form.id.value = ""; openPanel(); });
cancelBtn.addEventListener("click", closePanel);

async function loadRows() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="4">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No workshops yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row) => `
    <tr data-row="${row.id}">
      <td>${escapeHtml(row.category)}</td>
      <td>${escapeHtml(row.title)}</td>
      <td>${escapeHtml(row.subtitle || "")}</td>
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
      form.subtitle.value = row.subtitle || "";
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
        status.textContent = "Error: " + error.message;
        status.classList.add("error");
        openPanel();
        return;
      }
      loadRows();
    });
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className = "form-status";

  const payload = {
    category: form.category.value.trim(),
    title: form.title.value.trim(),
    subtitle: form.subtitle.value.trim() || null,
    description: form.description.value.trim() || null,
    sort_order: Number(form.sort_order.value) || 0,
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
