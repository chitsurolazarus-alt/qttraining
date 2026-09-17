import { supabase } from "./supabase-client.js";

export function attachNewsletterForm(selector) {
  const form = document.querySelector(selector);
  if (!form) return;

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[name="email"]').value.trim();
    if (!email) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (status) { status.textContent = ""; status.className = "form-status"; }

    const { error } = await supabase.from("subscribers").insert({ email });

    if (submitBtn) submitBtn.disabled = false;

    if (error) {
      if (status) {
        status.textContent = error.code === "23505"
          ? "That email is already subscribed."
          : "Something went wrong. Please try again.";
        status.classList.add("error");
      }
      return;
    }

    form.reset();
    if (status) {
      status.textContent = "Thanks! You're subscribed.";
      status.classList.add("success");
    }
  });
}
