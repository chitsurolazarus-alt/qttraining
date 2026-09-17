import { supabase } from "./supabase-client.js";
import { attachNewsletterForm } from "./newsletter.js";

function attachEnquiryForm() {
  const form = document.querySelector("[data-enquiry-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      message: form.message.value.trim(),
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (status) { status.textContent = ""; status.className = "form-status"; }

    const { error } = await supabase.from("enquiries").insert(payload);

    if (submitBtn) submitBtn.disabled = false;

    if (error) {
      if (status) {
        status.textContent = "Something went wrong sending your message. Please try again or call us directly.";
        status.classList.add("error");
      }
      return;
    }

    form.reset();
    if (status) {
      status.textContent = "Thanks! We've received your message and will be in touch soon.";
      status.classList.add("success");
    }
  });
}

attachEnquiryForm();
attachNewsletterForm("[data-newsletter-form]");
