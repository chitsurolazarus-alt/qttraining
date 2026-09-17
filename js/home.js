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

async function loadHomeUpdates() {
  const section = document.querySelector("[data-home-updates]");
  const newsBanner = document.querySelector("[data-news-banner]");
  const eventBanner = document.querySelector("[data-event-banner]");
  if (!section || !newsBanner || !eventBanner) return;

  const today = new Date().toISOString().slice(0, 10);

  const [newsResult, eventResult] = await Promise.all([
    supabase
      .from("news_posts")
      .select("title, excerpt")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(1),
    supabase
      .from("events")
      .select("title, event_date, location")
      .eq("is_published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1),
  ]);

  let anyVisible = false;

  const post = newsResult.data && newsResult.data[0];
  if (post) {
    newsBanner.querySelector('[data-field="title"]').textContent = post.title;
    newsBanner.querySelector('[data-field="body"]').textContent = post.excerpt || "";
    newsBanner.style.display = "";
    anyVisible = true;
  }

  const event = eventResult.data && eventResult.data[0];
  if (event) {
    eventBanner.querySelector('[data-field="title"]').textContent = event.title;
    const metaLine = [formatDate(event.event_date), event.location].filter(Boolean).join(" · ");
    eventBanner.querySelector('[data-field="body"]').textContent = metaLine;
    eventBanner.style.display = "";
    anyVisible = true;
  }

  if (anyVisible) section.style.display = "";
}

loadTestimonial();
loadHomeUpdates();
