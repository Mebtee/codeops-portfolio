const state = {
    dishes: [],
    cart: [],
    search: "",
};

const menuEl = document.querySelector('.dishes-grid');
const searchEl = document.querySelector('.search-bar input, .search bar input, input[placeholder="search for foods"]');
const cartEl = document.querySelector('.cart-items');
const cartSummaryEl = document.querySelector('.cart-summary');

// 1. Fetch menu data
async function loadMenu() {
    if (!menuEl) return;
    menuEl.textContent = "Loading menu...";
    
    try {
        const res = await fetch('./data/menu.json');
        if (!res.ok) throw new Error("HTTP " + res.status);
        state.dishes = await res.json();
        render();
    } catch (err) {
        console.error(err);
        menuEl.textContent = "Couldn't load the menu.";
    }
}

// 2. Render Dishes
function render() {
    const term = state.search.toLowerCase();
    const shown = state.dishes.filter(d =>
        d.name.toLowerCase().includes(term)
    );

    menuEl.innerHTML = shown.map(d => `
        <div class="dish-card" data-id="${d.id}">
            <h3>${d.name}</h3>
            <p><b>Category:</b> ${d.category || 'Main'}</p>
            <div class="card-footer">
                <span class="price">${d.price} ETB</span>
                <button class="add-btn">+</button>
            </div>
        </div>
    `).join("");

    renderCart();
}

// 3. Render Cart
function renderCart() {
    if (!cartEl) return;

    if (state.cart.length === 0) {
        cartEl.innerHTML = "<p style='color: var(--text-light);'>Your cart is empty.</p>";
    } else {
        cartEl.innerHTML = state.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-details">
                    <div class="item-title">${item.name}</div>
                </div>
                <div class="item-actions">
                    <div class="price">${item.price * item.qty} ETB</div>
                    <div class="qty-control">
                        <button class="qty-btn decrease">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn increase">+</button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    // Update totals
    const total = cartTotal();
    if (cartSummaryEl) {
        const subtotalSpan = cartSummaryEl.querySelector('.summary-row span:last-child');
        const totalSpan = cartSummaryEl.querySelector('.summary-total span:last-child');
        if (subtotalSpan) subtotalSpan.textContent = `${total} ETB`;
        if (totalSpan) totalSpan.textContent = `${total} ETB`;
    }
}

function cartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function save() {
    localStorage.setItem("addiseats", JSON.stringify(state.cart));
}

function load() {
    const saved = localStorage.getItem("addiseats");
    if (saved) state.cart = JSON.parse(saved);
}

// 4. Event Listeners

// Search filtering
if (searchEl) {
    searchEl.addEventListener("input", (e) => {
        state.search = e.target.value;
        render();
    });
}

// Add item to cart
if (menuEl) {
    menuEl.addEventListener("click", (e) => {
        if (!e.target.classList.contains("add-btn")) return;
        
        const card = e.target.closest(".dish-card");
        if (!card) return;
        
        const id = Number(card.dataset.id);
        const dish = state.dishes.find(d => d.id === id);
        const cartItem = state.cart.find(i => i.id === id);

        if (cartItem) {
            cartItem.qty++;
        } else if (dish) {
            state.cart.push({ ...dish, qty: 1 });
        }

        save();
        renderCart();
    });
}

// Increase / Decrease / Remove cart items
if (cartEl) {
    cartEl.addEventListener("click", (e) => {
        const btn = e.target;
        if (!btn.classList.contains("qty-btn")) return;

        const cartItemEl = btn.closest(".cart-item");
        if (!cartItemEl) return;

        const id = Number(cartItemEl.dataset.id);
        const cartItem = state.cart.find(i => i.id === id);
        if (!cartItem) return;

        if (btn.classList.contains("increase")) {
            cartItem.qty++;
        } else if (btn.classList.contains("decrease")) {
            cartItem.qty--;
            if (cartItem.qty <= 0) {
                state.cart = state.cart.filter(i => i.id !== id);
            }
        }

        save();
        renderCart();
    });
}

// 5. Initialize
async function init() {
    load();        // Restore saved cart
    await loadMenu(); // Fetch menu & render everything
}

init();