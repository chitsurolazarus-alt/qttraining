import { supabase } from "./supabase-client.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function toThumb(url) {
  return url.replace("assets/images/", "assets/images/thumbs/");
}

let allImages = [];

function renderGrid(filter) {
  const grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;

  const items = filter === "all" ? allImages : allImages.filter((i) => i.category === filter);

  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-state">No images in this category yet.</p>';
    return;
  }

  grid.innerHTML = items.map((img) => `
    <a class="gallery-item" href="${escapeHtml(img.image_url)}" target="_blank" rel="noopener">
      <img src="${escapeHtml(toThumb(img.image_url))}" alt="${escapeHtml(img.caption || "QT Training photo")}" loading="lazy">
    </a>
  `).join("");
}

function renderFilters(categories) {
  const wrap = document.querySelector("[data-gallery-filters]");
  if (!wrap) return;

  const allBtn = wrap.querySelector('[data-filter="all"]');
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.filter = cat;
    btn.textContent = cat;
    wrap.appendChild(btn);
  });

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    wrap.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderGrid(btn.dataset.filter);
  });
}

async function loadGallery() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("image_url, caption, category, sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error(error);
    document.querySelector("[data-gallery-grid]").innerHTML =
      '<p class="empty-state">Gallery is being updated. Please check back soon.</p>';
    return;
  }

  allImages = data;
  const categories = [...new Set(data.map((i) => i.category).filter(Boolean))];
  renderFilters(categories);
  renderGrid("all");
}

loadGallery();
