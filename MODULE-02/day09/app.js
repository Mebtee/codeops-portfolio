// 1. STATE MANAGEMENT
// The single source of truth for the entire application
let items = [];

// DOM Elements
const form = document.querySelector('#item-form');
const input = document.querySelector('#item-input');
const shoppingList = document.querySelector('#shopping-list');
const counter = document.querySelector('#item-counter');

// 2. RENDER FUNCTION
// Pure function that syncs the DOM with the state array
function render() {
  // Clear existing UI content
  shoppingList.innerHTML = '';

  // Draw each item based on state
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'item-row';

    const span = document.createElement('span');
    span.className = `item-text ${item.bought ? 'bought' : ''}`;
    span.textContent = item.name;

    // Toggle bought status on click
    span.addEventListener('click', () => toggleBought(item.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Remove';
    
    // Remove item on click
    deleteBtn.addEventListener('click', () => removeItem(item.id));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    shoppingList.appendChild(li);
  });

  // Update live counter
  counter.textContent = items.length;
}

// 3. STATE MUTATIONS (State Logic -> Render)

function addItem(name) {
  const newItem = {
    id: Date.now(),
    name: name.trim(),
    bought: false
  };
  items.push(newItem);
  render(); // Re-render DOM after state change
}

function toggleBought(id) {
  items = items.map((item) =>
    item.id === id ? { ...item, bought: !item.bought } : item
  );
  render(); // Re-render DOM after state change
}

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  render(); // Re-render DOM after state change
}

// 4. EVENT LISTENERS
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  
  if (value !== '') {
    addItem(value);
    input.value = '';
    input.focus();
  }
});

// Initial Render
render();