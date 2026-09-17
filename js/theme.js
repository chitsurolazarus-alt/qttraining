// Light/dark theme toggle button, remembered in localStorage.
// The initial theme is applied by a tiny inline snippet in <head> (before
// paint) to avoid a flash of the wrong theme; this file only wires the button.
(function () {
  const STORAGE_KEY = "qt-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    function currentIsDark() {
      const attr = root.getAttribute("data-theme");
      if (attr) return attr === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function updateIcon() {
      btn.textContent = currentIsDark() ? "☀" : "☾";
      btn.setAttribute("aria-label", currentIsDark() ? "Switch to light theme" : "Switch to dark theme");
    }

    updateIcon();

    btn.addEventListener("click", function () {
      const next = currentIsDark() ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
      updateIcon();
    });
  });
})();
