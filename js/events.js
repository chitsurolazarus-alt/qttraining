import { supabase } from "./supabase-client.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "Date to be confirmed";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

function renderList(target, events, emptyMessage) {
  if (!events || events.length === 0) {
    target.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }
  target.innerHTML = events.map((ev) => `
    <article class="entry-card">
      ${ev.cover_image_url ? `<a class="entry-image-link" href="${escapeHtml(ev.cover_image_url)}" target="_blank" rel="noopener"><img src="${escapeHtml(ev.cover_image_url)}" alt="${escapeHtml(ev.title)}"></a>` : ""}
      <div class="entry-card-body">
        <div class="entry-date">${formatDate(ev.event_date)}${ev.location ? " &middot; " + escapeHtml(ev.location) : ""}</div>
        <h3>${escapeHtml(ev.title)}</h3>
        <p>${escapeHtml(ev.description || "")}</p>
      </div>
    </article>
  `).join("");
}

async function loadEvents() {
  const upcomingTarget = document.querySelector("[data-events-upcoming]");
  const pastTarget = document.querySelector("[data-events-past]");
  if (!upcomingTarget || !pastTarget) return;

  const { data, error } = await supabase
    .from("events")
    .select("title, description, event_date, location, cover_image_url, status")
    .eq("is_published", true)
    .order("event_date", { ascending: true });

  if (error || !data) {
    upcomingTarget.innerHTML = '<p class="empty-state">Events are being updated. Please check back soon.</p>';
    pastTarget.innerHTML = "";
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  function isUpcoming(e) {
    if (e.status === "upcoming") return true;
    if (e.status === "past") return false;
    return !e.event_date || e.event_date >= today;
  }
  const upcoming = data.filter(isUpcoming);
  const past = data.filter((e) => !isUpcoming(e)).reverse();

  renderList(upcomingTarget, upcoming, "No upcoming events scheduled right now.");
  renderList(pastTarget, past, "No past events to show yet.");
}

loadEvents();
