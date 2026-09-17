// Scroll-reveal + animated stat counters for the public site.
// Respects prefers-reduced-motion by skipping straight to the end state.
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealSelectors = [
    ".photo-card", ".entry-card", ".workshop-card", ".step-card",
    ".value-chip", ".testimonial-card", ".course-group", ".workshop-group",
    ".contact-info-card",
  ];
  const revealEls = Array.from(document.querySelectorAll(revealSelectors.join(",")));

  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("reveal-visible"));
    } else {
      revealEls.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 6) * 70 + "ms";
      });
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  const counters = document.querySelectorAll("[data-counter]");
  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.counterSuffix || "";
    if (prefersReduced || Number.isNaN(target)) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach((el) => counterObserver.observe(el));
    }
  }
})();
