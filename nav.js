// Shared by every page: mobile menu and scroll reveal.
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#mobile-nav");

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menu.hidden = !open;
  }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Scroll reveal: content fades up as it enters the screen. Waits for
  // DOMContentLoaded so main.js has rendered the shop; skipped entirely
  // for visitors who prefer reduced motion.
  const REVEAL = [
    ".section-heading", ".method > div", ".pillars article", ".class-card", ".schedule",
    ".coach-card", ".planner-copy", ".planner-panel", ".bmi-copy", ".bmi-panel",
    ".price-grid article", ".product-card", ".review-card", ".faq > div", ".closing h2",
    ".profile-quote blockquote", ".profile-details > div", ".profile-more", ".case-reveal",
  ].join(",");

  document.addEventListener("DOMContentLoaded", () => {
    if (!("IntersectionObserver" in window)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(REVEAL).forEach((target) => {
      if (target.getBoundingClientRect().top < innerHeight) return; // already on screen
      // Stagger cards that sit side by side in the same grid.
      const index = [...target.parentElement.children].filter((c) => c.matches(REVEAL)).indexOf(target);
      target.style.setProperty("--reveal-i", Math.min(index, 5));
      target.classList.add("reveal");
      // Hand the element back to its own hover transitions once revealed.
      target.addEventListener("transitionend", function done(event) {
        if (event.target !== target || !target.classList.contains("is-visible")) return;
        target.classList.remove("reveal", "is-visible");
        target.removeEventListener("transitionend", done);
      });
      observer.observe(target);
    });
  });
})();
