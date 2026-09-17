import { supabase } from "../supabase-client.js";

(async function redirectIfLoggedIn() {
  const { data } = await supabase.auth.getSession();
  if (data.session) window.location.href = "dashboard.html";
})();

const form = document.querySelector("[data-login-form]");
const status = form.querySelector("[data-form-status]");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = "";
  status.className = "form-status";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  submitBtn.disabled = false;

  if (error) {
    status.textContent = "Login failed: " + error.message;
    status.classList.add("error");
    return;
  }

  window.location.href = "dashboard.html";
});
