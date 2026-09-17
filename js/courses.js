import { supabase } from "./supabase-client.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function renderGroups(courses) {
  const wrap = document.querySelector("[data-course-groups]");
  if (!wrap) return;

  if (!courses || courses.length === 0) {
    wrap.innerHTML = '<p class="empty-state">Course listings are being updated. Please check back soon, or contact us directly.</p>';
    return;
  }

  const byCategory = new Map();
  courses.forEach((c) => {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  });

  let html = "";
  byCategory.forEach((items, category) => {
    html += `<div class="course-group">
      <h3>${escapeHtml(category)}</h3>
      <table class="course-table">
        <thead>
          <tr><th>Qualification</th><th>ID / Code</th><th>NQF Level</th><th>Credits</th></tr>
        </thead>
        <tbody>
          ${items.map((c) => `
            <tr>
              <td>${escapeHtml(c.title)}</td>
              <td>${escapeHtml(c.code)}</td>
              <td><span class="pill">NQF ${escapeHtml(c.nqf_level)}</span></td>
              <td>${escapeHtml(c.credits)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
  });

  wrap.innerHTML = html;
}

async function loadCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("category, title, code, nqf_level, credits, sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    renderGroups([]);
    return;
  }
  renderGroups(data);
}

loadCourses();
