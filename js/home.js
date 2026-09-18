import { supabase } from "./supabase-client.js";

async function loadTestimonial() {
  const target = document.querySelector("[data-testimonial-target]");
  if (!target) return;
  const { data, error } = await supabase
    .from("testimonials")
    .select("quote, author_name, author_role, company")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return;

  const t = data[0];
  const roleLine = [t.author_role, t.company].filter(Boolean).join(", ");
  target.innerHTML = `
    <blockquote>&ldquo;${t.quote}&rdquo;</blockquote>
    <div class="testimonial-author">${t.author_name}</div>
    <div class="testimonial-role">${roleLine}</div>
  `;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

async function loadNewsEventsGrid() {
  const grid = document.querySelector("[data-news-events-grid]");
  if (!grid) return;

  const [eventsResult, newsResult] = await Promise.all([
    supabase
      .from("events")
      .select("title, description, event_date, location, cover_image_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("news_posts")
      .select("title, excerpt, published_at, cover_image_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(2),
  ]);

  const items = [
    ...(eventsResult.data || []).map((e) => ({
      type: "Event",
      title: e.title,
      description: e.description,
      meta: [formatDate(e.event_date) || "Date to be confirmed", e.location].filter(Boolean).join(" · "),
      image: e.cover_image_url,
      href: "events.html",
    })),
    ...(newsResult.data || []).map((n) => ({
      type: "News",
      title: n.title,
      description: n.excerpt,
      meta: formatDate(n.published_at),
      image: n.cover_image_url,
      href: "news.html",
    })),
  ];

  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-state">No news or events yet. Check back soon.</p>';
    return;
  }

  grid.innerHTML = items.map((item) => `
    <a class="news-card" href="${escapeHtml(item.href)}">
      <div class="nc-media">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ""}
        <span class="news-badge${item.type === "News" ? " is-news" : ""}">${escapeHtml(item.type)}</span>
      </div>
      <div class="nc-body">
        ${item.meta ? `<div class="nc-meta">${escapeHtml(item.meta)}</div>` : ""}
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </div>
    </a>
  `).join("");
}

loadTestimonial();
loadNewsEventsGrid();
