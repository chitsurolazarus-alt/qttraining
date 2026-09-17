import { supabase } from "../supabase-client.js";

export async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return null;
  }
  return data.session;
}

export function attachLogout(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}

export function attachSidebarToggle() {
  const toggle = document.querySelector("[data-admin-menu-toggle]");
  const sidebar = document.querySelector("[data-admin-sidebar]");
  const backdrop = document.querySelector("[data-admin-sidebar-backdrop]");
  if (!toggle || !sidebar) return;
  toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  if (backdrop) {
    backdrop.addEventListener("click", () => sidebar.classList.remove("open"));
  }
}

export function showAdminEmail(session) {
  const name = session?.user?.user_metadata?.display_name
    || session?.user?.user_metadata?.full_name
    || session?.user?.email
    || "";
  document.querySelectorAll("[data-admin-email]").forEach((el) => {
    el.textContent = name;
  });
}
