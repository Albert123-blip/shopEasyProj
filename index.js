/* ---------- Product data ---------- */

const products = [
    { id: 1,  name: "Electric Kettle",        price: 49.99,  description: "Minimalist Kettle for your kitchen.",          image: "images/ecommerce_home_01.png", alt: "Electric Kettle" },
    { id: 2,  name: "Glass Food-Storage Set", price: 69.99,  description: "Three glass storage set suitable for food.",    image: "images/ecommerce_home_02.png", alt: "Glass food-storage set" },
    { id: 3,  name: "Over-Ear Headphones",    price: 89.99,  description: "Cushioned headphones for everyday listening.",  image: "images/ecommerce_tech_03.png", alt: "Over-ear headphones" },
    { id: 4,  name: "Portable Power Bank",    price: 29.99,  description: "Slim charger for devices on the go.",           image: "images/ecommerce_tech_04.png", alt: "Portable power bank" },
    { id: 5,  name: "Adjustable LED Lamp",    price: 44.99,  description: "Adjustable light for your workspace.",          image: "images/ecommerce_tech_05.png", alt: "Adjustable LED desk lamp" },
    { id: 6,  name: "Compact Webcam",         price: 39.99,  description: "Webcam for calls and remote work.",             image: "images/ecommerce_tech_06.png", alt: "Compact webcam" },
    { id: 7,  name: "Wireless Keyboard",      price: 54.99,  description: "Low-profile keyboard for home or office.",      image: "images/ecommerce_tech_07.png", alt: "Wireless keyboard" },
    { id: 8,  name: "Robot Vacuum",           price: 199.99, description: "Compact robot vacuum for everyday cleaning.",   image: "images/ecommerce_tech_08.png", alt: "Robot vacuum" },
    { id: 9,  name: "Wireless Earbuds",       price: 49.99,  description: "Wireless earbuds with a charging case.",        image: "images/ecommerce_tech_09.png", alt: "Wireless earbuds" },
    { id: 10, name: "Bluetooth Speaker",      price: 34.99,  description: "Compact speaker with fabric finish.",           image: "images/ecommerce_tech_10.png", alt: "Bluetooth speaker" }
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/* ---------- Elements ---------- */

const cartIcon = document.getElementById("cart-container");
const cartCount = document.getElementById("cart-count");
const inputSearch = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchContainer = document.querySelector(".search-container");
const cardGrid = document.getElementById("card-grid");
const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const drawer = document.getElementById("cart-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerClose = document.getElementById("drawer-close");
const toast = document.getElementById("toast");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

const noResults = document.createElement("p");
noResults.className = "no-results hidden";
noResults.textContent = "Product not available";
cardGrid.after(noResults);

/* ---------- Cart state: [{ id, quantity }] ---------- */

const STORAGE_KEY = "shopeasyCart";
let cart = loadCart();

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(saved)) return [];
      
        return saved.filter(item =>
            products.some(p => p.id === item.id) &&
            Number.isInteger(item.quantity) && item.quantity > 0
        );
    } catch (e) {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
       
    }
}

function getProduct(id) {
    return products.find(p => p.id === id);
}

function cartTotalPrice() {
    return cart.reduce((sum, item) => sum + getProduct(item.id).price * item.quantity, 0);
}

function updateCart() {
    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
    cartCount.classList.toggle("hidden", total === 0);
}

function addToCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, quantity: 1 });
    }
    updateCart();
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

/* ---------- Render products ---------- */

function renderProducts(list) {
    cardGrid.innerHTML = list.map(p => `
        <div class="card" data-id="${p.id}">
            <img class="card-img" src="${p.image}" alt="${p.alt}" loading="lazy">
            <div class="card-body">
                <div class="card-top">
                    <h3>${p.name}</h3>
                    <span class="price">${currency.format(p.price)}</span>
                </div>
                <p class="description">${p.description}</p>
                <div class="card-footer">
                    <button class="add-btn">Add to cart</button>
                </div>
            </div>
        </div>
    `).join("");
}

function filterProducts() {
    const query = inputSearch.value.trim().toLowerCase();
    const matches = products.filter(p => p.name.toLowerCase().includes(query));

    renderProducts(matches);

    const notFound = matches.length === 0;
    noResults.classList.toggle("hidden", !notFound);
    searchContainer.classList.toggle("error", notFound);
}

/* ---------- Render cart ---------- */

function renderCart() {
    cartList.innerHTML = "";

    cart.forEach(item => {
        const product = getProduct(item.id);

        const li = document.createElement("li");
        li.className = "cart-item";
        li.dataset.id = item.id;

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const name = document.createElement("span");
        name.className = "cart-item-name";
        name.textContent = product.name;

        const unit = document.createElement("span");
        unit.className = "cart-item-unit";
        unit.textContent = `${currency.format(product.price)} each`;

        info.append(name, unit);

        const qty = document.createElement("div");
        qty.className = "qty";

        const minus = document.createElement("button");
        minus.className = "qty-btn";
        minus.dataset.action = "decrease";
        minus.setAttribute("aria-label", `Decrease quantity of ${product.name}`);
        minus.textContent = "−";

        const count = document.createElement("span");
        count.className = "qty-count";
        count.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.className = "qty-btn";
        plus.dataset.action = "increase";
        plus.setAttribute("aria-label", `Increase quantity of ${product.name}`);
        plus.textContent = "+";

        qty.append(minus, count, plus);

        const linePrice = document.createElement("span");
        linePrice.className = "cart-item-price";
        linePrice.textContent = currency.format(product.price * item.quantity);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.dataset.action = "remove";
        removeBtn.setAttribute("aria-label", `Remove ${product.name} from cart`);
        removeBtn.textContent = "Remove";

        li.append(info, qty, linePrice, removeBtn);
        cartList.appendChild(li);
    });

    const hasItems = cart.length > 0;
    cartTotal.textContent = hasItems ? `Total: ${currency.format(cartTotalPrice())}` : "";
    cartEmpty.classList.toggle("hidden", hasItems);
    checkoutBtn.classList.toggle("hidden", !hasItems);
}

/* ---------- Add-to-cart feedback ---------- */

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

function bumpBadge() {
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth; // restart the animation
    cartCount.classList.add("bump");
}

function flashButton(btn) {
    btn.textContent = "Added ✓";
    btn.classList.add("added");
    setTimeout(() => {
        btn.textContent = "Add to cart";
        btn.classList.remove("added");
    }, 1200);
}

/* ---------- Drawer ---------- */

let lastFocused = null;

function openDrawer() {
    lastFocused = document.activeElement;
    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    drawerClose.focus();
}

function closeDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
}

cartIcon.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

document.querySelectorAll(".open-cart-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        openDrawer();
    });
});

/* ---------- Events ---------- */

// Product grid: add to cart + image preview (event delegation, since cards re-render)
cardGrid.addEventListener("click", event => {
    const addBtn = event.target.closest(".add-btn");
    if (addBtn) {
        const id = Number(addBtn.closest(".card").dataset.id);
        addToCart(id);
        flashButton(addBtn);
        bumpBadge();
        showToast(`${getProduct(id).name} added to cart`);
        return;
    }

    const img = event.target.closest(".card-img");
    if (img) openLightbox(img);
});

// Cart drawer: + / − / remove
cartList.addEventListener("click", event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.closest(".cart-item").dataset.id);
    const action = btn.dataset.action;

    if (action === "increase") changeQuantity(id, 1);
    if (action === "decrease") changeQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
});

inputSearch.addEventListener("input", filterProducts);
searchBtn.addEventListener("click", filterProducts);

function checkout() {
    if (cart.length === 0) return;

    alert(`Thank you for your order! Total: ${currency.format(cartTotalPrice())}`);

    cart = [];
    updateCart();
    closeDrawer();
}

checkoutBtn.addEventListener("click", checkout);

/* ---------- Lightbox ---------- */

function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.add("hidden");
    document.body.style.overflow = drawer.classList.contains("open") ? "hidden" : "";
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (!lightbox.classList.contains("hidden")) {
        closeLightbox();
    } else if (drawer.classList.contains("open")) {
        closeDrawer();
    }
});

/* ---------- Init ---------- */

renderProducts(products);
updateCartCount();
renderCart();