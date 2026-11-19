/* ==========================================================
   LUNA STORE — main.js
   Këtu janë produktet, shporta, filtrat dhe porositë.
   Shporta dhe porositë ruhen në localStorage, kështu që
   nuk humbin kur rifreskohet faqja.
   ========================================================== */

// Katalogu. Në një dyqan të vërtetë këto do të vinin nga një API,
// por për projektin mjafton një listë e thjeshtë.
const PRODUCTS = [
  { id: 1, name: "Handbag", category: "Fashion", price: 35, note: "Structured · Coral", image: "assets/handbag.jpg" },
  { id: 2, name: "Sunglasses", category: "Fashion", price: 20, note: "Gold-tone frames", image: "assets/sunglasses.jpg" },
  { id: 3, name: "Necklace", category: "Fashion", price: 15, note: "Chain link · Gold", image: "assets/necklace.jpg" },
  { id: 4, name: "Lipstick", category: "Beauty", price: 12, note: "Matte finish", image: "assets/lipstick.jpg" },
  { id: 5, name: "Perfume", category: "Beauty", price: 45, note: "Warm floral · 50 ml", image: "assets/perfume.jpg" },
  { id: 6, name: "Face Cream", category: "Beauty", price: 18, note: "Daily hydration", image: "assets/cream.jpg" },
  { id: 7, name: "Headphones", category: "Technology", price: 40, note: "Wireless · Over-ear", image: "assets/headphones.jpg" },
  { id: 8, name: "Smart Watch", category: "Technology", price: 75, note: "Fitness tracking", image: "assets/watch.jpg" },
  { id: 9, name: "Phone Case", category: "Technology", price: 10, note: "Shockproof · Slim", image: "assets/phonecase.jpg" }
];

const DELIVERY_FEE = 3;          // sa kushton dërgesa
const FREE_DELIVERY_FROM = 50;   // mbi këtë shumë dërgesa është falas
const CART_KEY = "luna-cart";
const ORDERS_KEY = "luna-orders";

let cart = readStorage(CART_KEY, []);      // [{ id, qty }]
let orders = readStorage(ORDERS_KEY, []);  // porositë e kryera
let activeCategory = "All";

/* ---------- Elementet e faqes ---------- */
const grid = document.getElementById("productGrid");
const noProducts = document.getElementById("noProducts");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const chips = document.querySelectorAll(".chip");

const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const deliveryEl = document.getElementById("delivery");
const totalEl = document.getElementById("total");
const deliveryHint = document.getElementById("deliveryHint");

const form = document.getElementById("orderForm");
const placeOrderBtn = document.getElementById("placeOrder");
const orderMessage = document.getElementById("orderMessage");
const fullNameInput = document.getElementById("fullName");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

const orderHistory = document.getElementById("orderHistory");
const orderEmpty = document.getElementById("orderEmpty");
const toast = document.getElementById("toast");

/* ---------- Ndihmës të vegjël ---------- */

// Lexon një listë nga localStorage; nëse diçka shkon keq, kthen vlerën rezervë.
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.warn("Nuk u lexua " + key, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Nuk u ruajt " + key, error);
  }
}

function money(value) {
  return "€" + value.toFixed(2);
}

// Për tekstin që vjen nga përdoruesi (emri, adresa) para se ta fusim në HTML.
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  // E fshehim përsëri pas dy sekondash. E ruajmë timerin
  // që klikimet e shpejta të mos e mbyllin para kohe.
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2200);
}

/* ==========================================================
   PRODUKTET
   ========================================================== */

function renderProducts() {
  const searchText = searchInput.value.trim().toLowerCase();

  // 1. Filtro sipas kategorisë dhe tekstit
  let list = PRODUCTS.filter(function (product) {
    const inCategory = activeCategory === "All" || product.category === activeCategory;
    const searchable = (product.name + " " + product.category + " " + product.note).toLowerCase();
    return inCategory && searchable.indexOf(searchText) !== -1;
  });

  // 2. Rendit sipas zgjedhjes
  if (sortSelect.value === "price-asc") {
    list.sort(function (a, b) { return a.price - b.price; });
  } else if (sortSelect.value === "price-desc") {
    list.sort(function (a, b) { return b.price - a.price; });
  } else if (sortSelect.value === "name") {
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  // 3. Vizato kartat
  grid.innerHTML = list.map(productCard).join("");
  grid.hidden = list.length === 0;
  noProducts.hidden = list.length !== 0;

  resultCount.textContent = list.length === 1
    ? "1 product"
    : list.length + " products";
}

function productCard(product) {
  return `
    <article class="card">
      <figure class="card__media">
        <img src="${product.image}" alt="${product.name}"
             width="600" height="750" loading="lazy">
      </figure>
      <div class="card__body">
        <p class="card__cat">${product.category}</p>
        <h3 class="card__name">${product.name}</h3>
        <p class="card__note">${product.note}</p>
        <div class="card__foot">
          <span class="card__price">${money(product.price)}</span>
          <button class="card__add" type="button" data-add="${product.id}"
                  aria-label="Add ${product.name} to cart">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 2v12M2 8h12"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>`;
}

/* ==========================================================
   SHPORTA
   ========================================================== */

// Kthen shportën bashkë me të dhënat e produktit. Nëse një produkt
// është hequr nga katalogu, ai rresht thjesht anashkalohet.
function cartLines() {
  const lines = [];

  cart.forEach(function (item) {
    const product = PRODUCTS.find(function (p) { return p.id === item.id; });
    if (product) {
      lines.push({ id: item.id, qty: item.qty, product: product });
    }
  });

  return lines;
}

function cartTotals() {
  let subtotal = 0;
  let count = 0;

  cartLines().forEach(function (line) {
    subtotal += line.product.price * line.qty;
    count += line.qty;
  });

  let delivery = 0;
  if (subtotal > 0 && subtotal < FREE_DELIVERY_FROM) {
    delivery = DELIVERY_FEE;
  }

  return {
    subtotal: subtotal,
    delivery: delivery,
    total: subtotal + delivery,
    count: count
  };
}

function addToCart(id) {
  const existing = cart.find(function (item) { return item.id === id; });

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, qty: 1 });
  }

  writeStorage(CART_KEY, cart);
  renderCart();

  const product = PRODUCTS.find(function (p) { return p.id === id; });
  showToast(product.name + " added to cart");
}

function changeQty(id, change) {
  const item = cart.find(function (entry) { return entry.id === id; });
  if (!item) return;

  item.qty += change;

  // Nëse zbret në zero, e heqim fare nga shporta.
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  writeStorage(CART_KEY, cart);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(function (item) { return item.id !== id; });
  writeStorage(CART_KEY, cart);
  renderCart();
}

function renderCart() {
  const lines = cartLines();

  cartItems.innerHTML = lines.map(function (line) {
    return `
      <div class="cart-row">
        <img class="cart-row__img" src="${line.product.image}" alt="${line.product.name}"
             width="76" height="92" loading="lazy">
        <div class="cart-row__info">
          <h3 class="cart-row__name">${line.product.name}</h3>
          <p class="cart-row__meta">${line.product.category} · ${money(line.product.price)} each</p>
        </div>
        <div class="qty">
          <button type="button" data-id="${line.id}" data-change="-1"
                  aria-label="Decrease quantity of ${line.product.name}">−</button>
          <span>${line.qty}</span>
          <button type="button" data-id="${line.id}" data-change="1"
                  aria-label="Increase quantity of ${line.product.name}">+</button>
        </div>
        <p class="cart-row__total">${money(line.product.price * line.qty)}</p>
        <button class="cart-row__remove" type="button" data-remove="${line.id}"
                aria-label="Remove ${line.product.name} from cart">
          <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M2 2l10 10M12 2L2 12"></path>
          </svg>
        </button>
      </div>`;
  }).join("");

  cartEmpty.hidden = lines.length > 0;

  const totals = cartTotals();

  subtotalEl.textContent = money(totals.subtotal);
  totalEl.textContent = money(totals.total);
  cartCount.textContent = totals.count;
  placeOrderBtn.disabled = totals.count === 0;

  if (totals.subtotal === 0) {
    deliveryEl.textContent = "—";
    deliveryHint.textContent = "Delivery is €" + DELIVERY_FEE + ", free over " + money(FREE_DELIVERY_FROM) + ".";
  } else if (totals.delivery === 0) {
    deliveryEl.textContent = "Free";
    deliveryHint.textContent = "Free delivery applied.";
  } else {
    deliveryEl.textContent = money(totals.delivery);
    deliveryHint.textContent = "Add " + money(FREE_DELIVERY_FROM - totals.subtotal) + " more for free delivery.";
  }
}

/* ==========================================================
   POROSIA
   ========================================================== */

function validateForm() {
  const errors = {};
  const name = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  if (name.length < 3) {
    errors.fullName = "Please enter your full name.";
  }

  // Lejon numra, hapësira, +, -, kllapa; të paktën 7 karaktere.
  if (!/^\+?[0-9\s()-]{7,}$/.test(phone)) {
    errors.phone = "Enter a valid phone number, e.g. +355 69 000 0000.";
  }

  if (address.length < 5) {
    errors.address = "Please enter the street and city.";
  }

  return errors;
}

function showErrors(errors) {
  const fields = [
    { input: fullNameInput, key: "fullName" },
    { input: phoneInput, key: "phone" },
    { input: addressInput, key: "address" }
  ];

  fields.forEach(function (field) {
    const message = errors[field.key] || "";
    const errorBox = document.getElementById("error-" + field.key);

    errorBox.textContent = message;
    field.input.classList.toggle("is-invalid", Boolean(message));
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
  });

  const firstError = fields.find(function (field) { return errors[field.key]; });
  if (firstError) firstError.input.focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  orderMessage.textContent = "";

  const errors = validateForm();
  showErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  if (cart.length === 0) {
    orderMessage.textContent = "Your cart is empty — add something first.";
    return;
  }

  const totals = cartTotals();
  const nextNumber = orders.reduce(function (max, order) {
    return Math.max(max, order.number);
  }, 0) + 1;

  // I ruajmë emrin dhe çmimin e produktit brenda porosisë,
  // që historia të mbetet e saktë edhe nëse katalogu ndryshon.
  const order = {
    number: nextNumber,
    date: new Date().toISOString(),
    customer: {
      name: fullNameInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim()
    },
    items: cartLines().map(function (line) {
      return {
        name: line.product.name,
        price: line.product.price,
        qty: line.qty
      };
    }),
    subtotal: totals.subtotal,
    delivery: totals.delivery,
    total: totals.total
  };

  orders.unshift(order); // më e reja në krye
  writeStorage(ORDERS_KEY, orders);

  cart = [];
  writeStorage(CART_KEY, cart);

  form.reset();
  showErrors({});
  renderCart();
  renderOrders();

  orderMessage.textContent = "Order #" + order.number + " placed. Thank you, " + order.customer.name + "!";
  showToast("Order placed. See you soon!");
});

/* ==========================================================
   HISTORIA E POROSIVE
   ========================================================== */

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderOrders() {
  orderHistory.innerHTML = orders.map(function (order) {
    const items = order.items.map(function (item) {
      return `<li><span>${escapeHtml(item.name)} × ${item.qty}</span>
                  <span>${money(item.price * item.qty)}</span></li>`;
    }).join("");

    return `
      <article class="order">
        <div class="order__head">
          <h3>Order #${order.number}</h3>
          <time class="order__date" datetime="${order.date}">${formatDate(order.date)}</time>
        </div>
        <ul class="order__items">${items}</ul>
        <div class="order__foot">
          <span class="order__ship">
            ${escapeHtml(order.customer.name)} · ${escapeHtml(order.customer.address)}
          </span>
          <strong>${money(order.total)}</strong>
        </div>
      </article>`;
  }).join("");

  orderEmpty.hidden = orders.length > 0;
  document.getElementById("clearOrders").hidden = orders.length === 0;
}

/* ==========================================================
   EVENTET
   ========================================================== */

// Një dëgjues i vetëm për të gjithë rrjetën e produkteve.
grid.addEventListener("click", function (event) {
  const button = event.target.closest("[data-add]");
  if (button) {
    addToCart(Number(button.dataset.add));
  }
});

// E njëjta gjë për shportën: shto / hiq / fshi.
cartItems.addEventListener("click", function (event) {
  const qtyButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {
    changeQty(Number(qtyButton.dataset.id), Number(qtyButton.dataset.change));
  } else if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    activeCategory = chip.dataset.category;

    chips.forEach(function (other) {
      const isActive = other === chip;
      other.classList.toggle("is-active", isActive);
      other.setAttribute("aria-pressed", String(isActive));
    });

    renderProducts();
  });
});

document.getElementById("resetFilters").addEventListener("click", function () {
  searchInput.value = "";
  activeCategory = "All";
  sortSelect.value = "featured";

  chips.forEach(function (chip) {
    const isActive = chip.dataset.category === "All";
    chip.classList.toggle("is-active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
});

// Pastrojmë gabimin e fushës sapo përdoruesi fillon të shkruajë.
[fullNameInput, phoneInput, addressInput].forEach(function (input) {
  input.addEventListener("input", function () {
    input.classList.remove("is-invalid");
    input.setAttribute("aria-invalid", "false");
    document.getElementById("error-" + input.id).textContent = "";
  });
});

document.getElementById("clearOrders").addEventListener("click", function () {
  if (orders.length === 0) return;

  const confirmed = confirm("Delete all saved orders? This cannot be undone.");
  if (!confirmed) return;

  orders = [];
  writeStorage(ORDERS_KEY, orders);
  renderOrders();
  showToast("Order history cleared");
});

/* ---------- Nisja ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
renderOrders();
