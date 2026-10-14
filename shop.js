// FORM demo shop: product catalogue, category filters and a shopping bag
// that is saved on this device, so it follows the visitor between pages.
// Used by the home page (a selection, via data-show) and shop.html (everything).
(() => {
  const { $, $$, showToast, closeOnBackdrop, setActive, downloadText, el } = window.FORM;

  const BAG_KEY = "form-bag";
  const MAX_QUANTITY = 10;
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const WOMEN_SIZES = ["XS", "S", "M", "L", "XL"];

  // image: file prefix in assets/ (with -360 and -640 WebP variants), or null
  // to show a "photo coming soon" card until a photo is added.
  const products = [
    { id: "hoodie", name: "Everyday Hoodie", tags: ["hoodies", "men", "women"], price: 78, image: null, isNew: true, description: "Heavyweight navy pullover with a mint FORM mark.", sizes: SIZES },
    { id: "zip-hoodie", name: "Studio Zip Hoodie", tags: ["hoodies", "men", "women"], price: 84, image: null, isNew: true, description: "Slate blue full-zip with thumbholes and a white FORM mark.", sizes: SIZES },
    { id: "tights", name: "Women’s Training Tights", tags: ["women"], price: 64, image: null, isNew: true, description: "High-rise navy tights with a side phone pocket.", sizes: WOMEN_SIZES },
    { id: "shorts", name: "Women’s Training Shorts", tags: ["women"], price: 42, image: null, isNew: true, description: "Lightweight slate blue shorts with a 4-inch inseam.", sizes: WOMEN_SIZES },
    { id: "men", name: "Men’s Training Set", tags: ["men"], price: 52, image: "merch-men", description: "Charcoal training tee + blue cap.", sizes: SIZES },
    { id: "women", name: "Women’s Studio Set", tags: ["women"], price: 52, image: "merch-women", description: "Slate blue cropped tee + ivory tote.", sizes: SIZES },
    { id: "volleyball", name: "Volleyball Court Kit", tags: ["sport"], price: 68, image: "merch-volleyball", description: "Unisex jersey, shorts + volleyball.", sizes: SIZES },
    { id: "football", name: "Football Match Kit", tags: ["sport"], price: 68, image: "merch-football", description: "Unisex jersey, shorts + football.", sizes: SIZES },
    { id: "equipment", name: "Gym Essentials", tags: ["equipment"], price: 58, image: "merch-equipment", description: "Bottle, exercise mat + resistance loop.", sizes: [] },
    { id: "sports", name: "Multisport Collection", tags: ["equipment"], price: 98, image: "merch-sports", description: "Basketball, volleyball, American football + duffel.", sizes: [] },
  ];

  const grid = $("#products");
  if (!grid) return;

  // The home page lists a selection; shop.html lists everything.
  const shown = grid.dataset.show
    ? grid.dataset.show.split(",").map((id) => products.find((p) => p.id === id.trim())).filter(Boolean)
    : products;
  const money = (n) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  const productById = (id) => products.find((p) => p.id === id);

  // ---- Bag, saved in localStorage
  function loadBag() {
    try {
      const saved = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((item) => productById(item.id)) : [];
    } catch {
      return [];
    }
  }
  const bag = loadBag(); // { id, size, quantity }

  function saveBag() {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch {
      // Private mode or storage blocked: the bag still works for this page view.
    }
  }

  // Other tabs or pages may change the bag; keep this page in step.
  window.addEventListener("storage", (event) => {
    if (event.key !== BAG_KEY) return;
    bag.splice(0, bag.length, ...loadBag());
    renderBag();
  });

  // ---- Product grid
  function photoFor(product) {
    if (!product.image) {
      return el("div", { className: "product-photo placeholder" },
        el("img", { src: assetPath("form-mark-96.webp"), alt: "", width: 48, height: 48 }),
        el("span", { textContent: "Photo coming soon" }),
      );
    }
    return el("div", { className: "product-photo" }, el("img", {
      src: assetPath(`${product.image}-640.webp`),
      srcset: `${assetPath(`${product.image}-360.webp`)} 360w,${assetPath(`${product.image}-640.webp`)} 640w`,
      sizes: "(max-width:700px) 45vw,30vw",
      alt: `AI-generated FORM ${product.name.toLowerCase()} with the club emblem`,
      width: 640,
      height: 640,
      loading: "lazy",
    }));
  }

  const assetPath = (file) => `assets/${file}`;

  function renderProducts(category = "all") {
    grid.replaceChildren();
    const list = shown.filter((product) => category === "all" || product.tags.includes(category));
    list.forEach((product) => {
      const buy = el("div", { className: "product-buy" });
      let sizeSelect;
      if (product.sizes.length) {
        sizeSelect = el("select");
        sizeSelect.setAttribute("aria-label", `${product.name} size`);
        product.sizes.forEach((size) => sizeSelect.append(el("option", { value: size, textContent: size })));
        sizeSelect.value = "M";
        buy.append(el("label", { textContent: "Size" }, sizeSelect));
      }

      const add = el("button", { className: "button", textContent: "Add to bag +" });
      add.setAttribute("aria-label", `Add ${product.name} to bag`);
      add.addEventListener("click", () => {
        const size = sizeSelect ? sizeSelect.value : "One size";
        const line = bag.find((item) => item.id === product.id && item.size === size);
        if (line) line.quantity = Math.min(line.quantity + 1, MAX_QUANTITY);
        else bag.push({ id: product.id, size, quantity: 1 });
        renderBag();
        showToast(`${product.name} added to your demo bag.`);
      });
      buy.append(add);

      const heading = el("div", { className: "product-heading" },
        el("h3", { textContent: product.name }),
        el("span", { textContent: money(product.price) }),
      );
      const card = el("article", { className: "product-card" }, photoFor(product), heading,
        el("p", { textContent: product.description }), buy);
      if (product.isNew) card.prepend(el("span", { className: "new-badge", textContent: "New" }));
      grid.append(card);
    });

    const count = $("#product-count");
    if (count) count.textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
  }

  // ---- Bag dialog
  const bagDialog = $("#bag-dialog");

  function renderBag() {
    saveBag();
    $("#bag-count").textContent = String(bag.reduce((sum, item) => sum + item.quantity, 0));
    const list = $("#bag-items");
    list.replaceChildren();

    if (!bag.length) {
      const empty = el("p", { textContent: "Your bag is waiting for a little FORM." });
      empty.style.marginTop = "25px";
      list.append(empty);
    }

    bag.forEach((item, index) => {
      const product = productById(item.id);
      const thumb = product.image
        ? el("img", { src: assetPath(`${product.image}-360.webp`), alt: product.name })
        : el("img", { src: assetPath("form-mark-96.webp"), alt: product.name, className: "bag-thumb-placeholder" });
      thumb.width = thumb.height = 58;

      const minus = el("button", { textContent: "−" });
      minus.setAttribute("aria-label", `Decrease ${product.name} quantity`);
      minus.onclick = () => {
        if (item.quantity > 1) item.quantity--;
        else bag.splice(index, 1);
        renderBag();
      };

      const plus = el("button", { textContent: "+", disabled: item.quantity >= MAX_QUANTITY });
      plus.setAttribute("aria-label", `Increase ${product.name} quantity`);
      plus.onclick = () => {
        item.quantity = Math.min(item.quantity + 1, MAX_QUANTITY);
        renderBag();
      };

      const remove = el("button", { className: "bag-remove", textContent: "Remove" });
      remove.setAttribute("aria-label", `Remove ${product.name} ${item.size}`);
      remove.onclick = () => {
        bag.splice(index, 1);
        renderBag();
      };

      list.append(el("div", { className: "bag-row" },
        thumb,
        el("div", {},
          el("strong", { textContent: product.name }),
          el("small", { textContent: `${item.size} · ${money(product.price)} each` }),
          el("div", { className: "bag-controls" }, minus, el("span", { textContent: item.quantity }), plus, remove),
        ),
        el("strong", { textContent: money(item.quantity * product.price) }),
      ));
    });

    $("#bag-subtotal").textContent = money(bag.reduce((sum, item) => sum + item.quantity * productById(item.id).price, 0));
    $("#download-bag").disabled = bag.length === 0;
    $("#bag-status").textContent = "";
  }

  const categoryButtons = $$("[data-category]");
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActive(categoryButtons, button);
      renderProducts(button.dataset.category);
    });
  });

  $("#open-bag").onclick = () => {
    renderBag();
    bagDialog.showModal();
  };
  $("#close-bag").onclick = () => bagDialog.close();
  bagDialog.addEventListener("click", closeOnBackdrop);

  $("#download-bag").onclick = () => {
    const lines = [
      "FORM — Demo shopping bag",
      ...bag.map((item) => {
        const product = productById(item.id);
        return `${product.name} / ${item.size} × ${item.quantity}: ${money(product.price * item.quantity)}`;
      }),
      "Subtotal: " + $("#bag-subtotal").textContent,
      "No order placed. No payment collected. Taxes and shipping not included.",
    ];
    downloadText("form-demo-bag.txt", lines.join("\n"));
    $("#bag-status").textContent = "Demo bag summary downloaded.";
  };

  // Let the home page's "clear saved demo data" button empty the bag too.
  window.FORM.clearBag = () => {
    bag.length = 0;
    renderBag();
  };

  // Deep link to a category, e.g. shop.html#hoodies
  const fromHash = location.hash.slice(1);
  const startButton = [...categoryButtons].find((b) => b.dataset.category === fromHash);
  if (startButton) setActive(categoryButtons, startButton);
  renderProducts(startButton ? fromHash : "all");
  renderBag();
})();
