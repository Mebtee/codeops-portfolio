const state = {
    dishes:[],
    cart:[],
    search:"",
}

const menuEl= document.querySelector('#menu');

async function loadMenu() {
    menuEl.textContent = "loading menu...";
    try{
        const res = await fetch("menu.json");
        if (!res.ok) throw new Error("HTTP" + res.status);
        state.dishes = await res.json();
        render();
    }
    catch(err){
        menuEl.textContent="couldn't load the menu."
    }
    }

// loadMenu();

function render() {
    const term = state.search.toLowerCase();
    const shown = state.dishes.filter(d =>
        d.name.toLowerCase().includes(term));
    menuEl.innerHTML = shown.map(d => `
        <article class="dish" data-id="${d.id}">
            <h3>${d.name}</h3>
            <p class="price">${d.price} ETB</p>
            <button class="add">Add</button>
        </article>`).join("");
    renderCart();
}