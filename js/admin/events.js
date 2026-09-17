import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";
import { uploadImage } from "./storage-upload.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "events";
const tbody = document.querySelector("[data-table-body]");
const form = document.querySelector("[data-form-panel]");
const addBtn = document.querySelector("[data-add-btn]");
const cancelBtn = document.querySelector("[data-cancel-btn]");
const status = document.querySelector("[data-form-status]");
const uploadNote = document.querySelector("[data-upload-note]");
const preview = document.querySelector("[data-upload-preview]");

function showPreview(url) {
  if (!preview) return;
  if (url) { preview.src = url; preview.style.display = "block"; }
  else { preview.src = ""; preview.style.display = "none"; }
}

form.cover_file.addEventListener("change", () => {
  const file = form.cover_file.files[0];
  if (file) showPreview(URL.createObjectURL(file));
});

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
  form.cover_image_url.value = "";
  showPreview(null);
  uploadNote.textContent = "";
  status.textContent = "";
  status.className = "form-status";
}

addBtn.addEventListener("click", () => { form.reset(); form.id.value = ""; openPanel(); });
cancelBtn.addEventListener("click", closePanel);

async function loadRows() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("event_date", { ascending: false, nullsFirst: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No events yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row) => `
    <tr data-row="${row.id}">
      <td>${escapeHtml(row.title)}</td>
      <td>${escapeHtml(row.event_date || "&mdash;")}</td>
      <td>${escapeHtml(row.location || "")}</td>
      <td><span class="badge ${row.is_published ? "yes" : "no"}">${row.is_published ? "Published" : "Draft"}</span></td>
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
      form.title.value = row.title || "";
      form.event_date.value = row.event_date || "";
      form.location.value = row.location || "";
      form.description.value = row.description || "";
      form.cover_image_url.value = row.cover_image_url || "";
      showPreview(row.cover_image_url || null);
      uploadNote.textContent = row.cover_image_url ? "Current image will be kept unless you choose a new file." : "";
      form.is_published.checked = !!row.is_published;
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

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const file = form.cover_file.files[0];
    if (file) {
      uploadNote.textContent = "Uploading image...";
      const url = await uploadImage(file, "events");
      form.cover_image_url.value = url;
      uploadNote.textContent = "Image uploaded.";
    }

    const payload = {
      title: form.title.value.trim(),
      event_date: form.event_date.value || null,
      location: form.location.value.trim() || null,
      description: form.description.value.trim() || null,
      cover_image_url: form.cover_image_url.value || null,
      is_published: form.is_published.checked,
    };

    const id = form.id.value;
    const query = id
      ? supabase.from(TABLE).update(payload).eq("id", id)
      : supabase.from(TABLE).insert(payload);

    const { error } = await query;
    if (error) throw error;

    closePanel();
    loadRows();
  } catch (err) {
    status.textContent = "Error: " + err.message;
    status.classList.add("error");
  } finally {
    submitBtn.disabled = false;
  }
});

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadRows();
})();
