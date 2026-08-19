const state = {
    dishes: [],
    cart: [],
    search: "",
};

const menuEl = document.querySelector('.dishes-grid');
const searchEl = document.querySelector('.search-bar input');

async function loadMenu() {
    if (!menuEl) return;
    menuEl.textContent = "Loading menu...";
    
    try {
        const res = await fetch('./data/menu.json');
        console.log(res);
        if (!res.ok) throw new Error("HTTP " + res.status);
        state.dishes = await res.json();
        render();
    } catch (err) {
        
        menuEl.textContent = "Couldn't load the menu.";
    }
}

function render() {
    const term = state.search.toLowerCase();
    const shown = state.dishes.filter(d =>
        d.name.toLowerCase().includes(term)
    );

    menuEl.innerHTML = shown.map(d => `
        <div class="dish-card" data-id="${d.id}">
            <h3>${d.name}</h3>
            <p><strong>Category:</strong> ${d.category || 'Main'}</p>
            <div class="card-footer">
                <span class="price">${d.price} ETB</span>
                <button class="add-btn">+</button>
            </div>
        </div>
    `).join("");

    if (typeof renderCart === "function") {
        renderCart();
    }
}

if (searchEl) {
    searchEl.addEventListener("input", (e) => {
        state.search = e.target.value;
        render();
    });
}

loadMenu();