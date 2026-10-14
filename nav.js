// Mobile menu, shared by every page.
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
})();
