import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

const TABLE = "site_settings";
const form = document.querySelector("[data-settings-form]");
const status = document.querySelector("[data-form-status]");

async function loadSettings() {
  const { data, error } = await supabase.from(TABLE).select("key, value");
  if (error) return;
  data.forEach((row) => {
    if (form[row.key]) form[row.key].value = row.value || "";
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className = "form-status";

  const keys = ["phone_primary", "phone_secondary", "email", "address", "facebook_url"];
  const rows = keys.map((key) => ({ key, value: form[key].value.trim() }));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: "key" });

  if (error) {
    status.textContent = "Error: " + error.message;
    status.classList.add("error");
    return;
  }

  status.textContent = "Settings saved.";
  status.classList.add("success");
});

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadSettings();
})();
