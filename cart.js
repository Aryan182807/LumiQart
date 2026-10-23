/* =========================================
   LUMIQART - CART SYSTEM
   Uses localStorage so cart stays after refresh.
========================================= */

const CART_KEY = "lumiqartCart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function formatPrice(value) {
    return Number(value).toLocaleString("en-IN");
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    document.querySelectorAll(".cart-btn, #cart-count").forEach(element => {
        if (element.id === "cart-count") {
            element.textContent = count;
        } else {
            element.textContent = `🛒 Cart (${count})`;
        }
    });
}

function addProductToCart(product, quantity = 1) {
    const cart = getCart();
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: qty
        });
    }

    saveCart(cart);
    alert(`${product.name} added to cart!`);
}

/* Add-to-cart buttons on individual product pages */
function setupProductPage() {
    const button = document.querySelector(".add-cart");
    const quantityInput = document.querySelector('.quantity input[type="number"]');
    const productName = document.querySelector(".product-detail-info h1");
    const priceElement = document.querySelector(".detail-price");
    const imageElement = document.querySelector(".product-detail-image img");

    if (!button || !productName || !priceElement || !imageElement) return;

    const pageName = window.location.pathname.split("/").pop().toLowerCase();
    const match = pageName.match(/^product(\d+)\.html$/);
    const id = match ? `product-${match[1]}` : productName.textContent.trim().toLowerCase().replace(/\s+/g, "-");

    button.addEventListener("click", function () {
        const price = Number(priceElement.textContent.replace(/[^0-9]/g, ""));
        const quantity = quantityInput ? quantityInput.value : 1;

        addProductToCart({
            id,
            name: productName.textContent.trim(),
            price,
            image: imageElement.src
        }, quantity);
    });
}

/* Add-to-cart buttons to the product cards on index.html */
function setupHomeProductCards() {
    document.querySelectorAll(".product-card").forEach(card => {
        if (card.querySelector(".card-add-cart")) return;

        const nameElement = card.querySelector("h3");
        const priceElement = card.querySelector(".price");
        const imageElement = card.querySelector("img");
        const detailsLink = card.querySelector("a.details-btn");

        if (!nameElement || !priceElement || !imageElement) return;

        const name = nameElement.textContent.trim().replace(/\s+/g, " ");
        const price = Number(priceElement.textContent.replace(/[^0-9]/g, ""));
        const image = imageElement.src;
        const id = detailsLink
            ? (detailsLink.getAttribute("href") || "").replace(".html", "")
            : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "details-btn card-add-cart";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {
            addProductToCart({ id, name, price, image }, 1);
        });

        const wrapper = detailsLink ? detailsLink.parentElement : card.querySelector(".product-info");
        if (wrapper) wrapper.appendChild(button);
    });
}

/* Cart page */
function setupCartPage() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    renderCart();
}

function renderCart() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    const cart = getCart();
    const totalItemsElement = document.getElementById("total-items");
    const totalElement = document.getElementById("cart-total");

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add products from Lumiqart to see them here.</p>
                <a href="index.html">Continue Shopping</a>
            </div>
        `;
        if (totalItemsElement) totalItemsElement.textContent = "0";
        if (totalElement) totalElement.textContent = "0";
        return;
    }

    let total = 0;
    let totalItems = 0;

    container.innerHTML = cart.map((item, index) => {
        const quantity = Number(item.quantity) || 1;
        const itemTotal = Number(item.price) * quantity;
        total += itemTotal;
        totalItems += quantity;

        return `
            <div class="cart-item">
                <div class="cart-image-wrap">
                    <img src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'">
                </div>

                <div class="cart-product-info">
                    <span class="cart-category">LUMIQART PRODUCT</span>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p class="cart-unit-price">₹${formatPrice(item.price)}</p>

                    <div class="quantity-controls">
                        <button type="button" onclick="changeCartQuantity(${index}, -1)">−</button>
                        <span>${quantity}</span>
                        <button type="button" onclick="changeCartQuantity(${index}, 1)">+</button>
                    </div>
                </div>

                <div class="cart-item-right">
                    <strong>₹${formatPrice(itemTotal)}</strong>
                    <button type="button" class="remove-cart-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    }).join("");

    if (totalItemsElement) totalItemsElement.textContent = totalItems;
    if (totalElement) totalElement.textContent = formatPrice(total);
}

function changeCartQuantity(index, change) {
    const cart = getCart();
    if (!cart[index]) return;

    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);

    saveCart(cart);
    renderCart();
}

function removeFromCart(index) {
    const cart = getCart();
    if (!cart[index]) return;

    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
}

function checkout() {
    const cart = getCart();
    if (!cart.length) {
        alert("Your cart is empty!");
        return;
    }

    alert("Checkout page will be connected next. Your cart is ready!");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    setupProductPage();
    setupHomeProductCards();
    setupCartPage();
});
