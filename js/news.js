import { supabase } from "./supabase-client.js";
import { attachNewsletterForm } from "./newsletter.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

async function loadNews() {
  const wrap = document.querySelector("[data-news-list]");
  if (!wrap) return;

  const { data, error } = await supabase
    .from("news_posts")
    .select("title, slug, excerpt, cover_image_url, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    wrap.innerHTML = '<p class="empty-state">No news posted yet. Check back soon.</p>';
    return;
  }

  wrap.innerHTML = data.map((post) => `
    <article class="entry-card">
      ${post.cover_image_url ? `<a class="entry-image-link" href="${escapeHtml(post.cover_image_url)}" target="_blank" rel="noopener"><img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}"></a>` : ""}
      <div class="entry-card-body">
        <div class="entry-date">${formatDate(post.published_at)}</div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt || "")}</p>
      </div>
    </article>
  `).join("");
}

loadNews();
attachNewsletterForm("[data-newsletter-form]");
