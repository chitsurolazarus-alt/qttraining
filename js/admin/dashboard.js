import { supabase } from "../supabase-client.js";
import { requireAuth, attachLogout, attachSidebarToggle, showAdminEmail } from "./auth-guard.js";

attachLogout("[data-logout-btn]");
attachSidebarToggle();

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

async function loadStats() {
  const today = new Date().toISOString().slice(0, 10);

  const [courses, workshops, news, events, testimonials, enquiries, subscribers] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("workshops").select("id", { count: "exact", head: true }),
    supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("is_published", true).gte("event_date", today),
    supabase.from("testimonials").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
  ]);

  const counts = [courses, workshops, news, events, testimonials, enquiries, subscribers];
  const stats = document.querySelectorAll("[data-stats-grid] .admin-stat .num");
  counts.forEach((result, i) => {
    if (stats[i]) stats[i].textContent = result.count ?? "0";
  });
}

async function loadLatestEnquiries() {
  const target = document.querySelector("[data-latest-enquiries]");
  if (!target) return;

  const { data, error } = await supabase
    .from("enquiries")
    .select("name, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    target.innerHTML = '<li style="color:var(--text-muted); padding:8px 0;">No enquiries yet.</li>';
    return;
  }

  target.innerHTML = data.map((row) => `
    <li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
      <span>${escapeHtml(row.name)}</span>
      <span style="color:var(--text-muted); font-size:.85rem;">${formatDate(row.submitted_at)}</span>
    </li>
  `).join("");
}

async function loadLatestSubscribers() {
  const target = document.querySelector("[data-latest-subscribers]");
  if (!target) return;

  const { data, error } = await supabase
    .from("subscribers")
    .select("email, subscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    target.innerHTML = '<li style="color:var(--text-muted); padding:8px 0;">No subscribers yet.</li>';
    return;
  }

  target.innerHTML = data.map((row) => `
    <li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
      <span>${escapeHtml(row.email)}</span>
      <span style="color:var(--text-muted); font-size:.85rem;">${formatDate(row.subscribed_at)}</span>
    </li>
  `).join("");
}

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  showAdminEmail(session);
  loadStats();
  loadLatestEnquiries();
  loadLatestSubscribers();
})();
