// Small helpers shared by main.js (home page) and shop.js (home + shop page).
window.FORM = (() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3500);
  }

  // Close a <dialog> when its backdrop (outside the box) is clicked.
  function closeOnBackdrop(event) {
    const dialog = event.currentTarget;
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  }

  // Mark one button in a group as active (and pressed for screen readers).
  function setActive(buttons, active) {
    buttons.forEach((button) => {
      button.classList.toggle("active", button === active);
      button.setAttribute("aria-pressed", String(button === active));
    });
  }

  function downloadText(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function el(tag, props = {}, ...children) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  }

  return { $, $$, showToast, closeOnBackdrop, setActive, downloadText, el };
})();
