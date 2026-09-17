// Controller for the homepage welcome splash (markup + CSS live alongside
// this: index.html has the #welcome-splash div, css/main.css has the
// "Welcome splash" rules). A synchronous inline script in index.html's
// <head> already adds html.no-splash before paint when this shouldn't
// play (already shown this session, or prefers-reduced-motion) — if
// that happened, there's nothing left for this file to do.
(function () {
  if (document.documentElement.classList.contains("no-splash")) return;

  const splash = document.getElementById("welcome-splash");
  if (!splash) return;

  const FLAG = "qt_welcome_shown";
  const SEQUENCE_MS = 1300; // when the visual sequence is considered "settled"
  const CAP_MS = 1700; // latest point dismissal may start, even on a slow load

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add("is-hiding");
    try { sessionStorage.setItem(FLAG, "1"); } catch (e) { /* ignore */ }
    setTimeout(() => splash.remove(), 500);
  }

  let sequenceDone = false;
  let loadDone = document.readyState === "complete";
  function maybeDismiss() {
    if (sequenceDone && loadDone) dismiss();
  }

  setTimeout(() => { sequenceDone = true; maybeDismiss(); }, SEQUENCE_MS);

  if (!loadDone) {
    window.addEventListener("load", () => { loadDone = true; maybeDismiss(); }, { once: true });
  }

  setTimeout(dismiss, CAP_MS);

  document.addEventListener("click", dismiss, { once: true });
  document.addEventListener("keydown", dismiss, { once: true });
  document.addEventListener("touchstart", dismiss, { once: true });
})();
