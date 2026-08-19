// State & Constants
const API_URL = 'https://v6.exchangerate-api.com/v6/0184538a5e303ddd9372f1ce/latest/USD';
const STORAGE_KEY = 'currency_app_state_to_etb';

const state = {
  rates: {},
  amount: '',
  sourceCurrency: '',
  watchlist: [],
  conversionResult: null,
};

// DOM Elements
const statusEl = document.getElementById('status');
const formEl = document.getElementById('converter-form');
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency-select');
const convertBtn = document.getElementById('convert-btn');
const addWatchlistBtn = document.getElementById('add-watchlist-btn');
const resultEl = document.getElementById('result');
const watchlistEl = document.getElementById('watchlist-list');

// Storage & State Persistence
function saveStateToStorage() {
  const dataToSave = {
    amount: state.amount,
    sourceCurrency: state.sourceCurrency,
    watchlist: state.watchlist,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadStateFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state.amount = parsed.amount || '';
    state.sourceCurrency = parsed.sourceCurrency || '';
    state.watchlist = Array.isArray(parsed.watchlist) ? parsed.watchlist : [];
  } catch (err) {
    console.error('Error reading state from LocalStorage:', err);
  }
}

// UI Renderers & Status Messages
function setStatus(type, message) {
  statusEl.className = 'status-bar'; // Reset classes
  if (!type) {
    statusEl.style.display = 'none';
    statusEl.textContent = '';
    return;
  }

  statusEl.classList.add(type);
  statusEl.textContent = message;
}

function renderDropdown() {
  const currencies = Object.keys(state.rates);
  
  if (currencies.length === 0) {
    currencySelect.innerHTML = `<option value="">No rates available</option>`;
    return;
  }

  const optionsHtml = ['<option value="" disabled selected>Select source currency</option>']
    .concat(
      currencies.map(code => `<option value="${code}">${code}</option>`)
    )
    .join('');

  currencySelect.innerHTML = optionsHtml;

  // Restore saved choice if it exists in current rates
  if (state.sourceCurrency && state.rates[state.sourceCurrency]) {
    currencySelect.value = state.sourceCurrency;
  }
}

function renderResult() {
  if (state.conversionResult === null) {
    resultEl.innerHTML = `<p class="placeholder-text">Select a currency and enter an amount to convert to ETB.</p>`;
    return;
  }

  const { amount, sourceCurrency, etbAmount, rateInEtb } = state.conversionResult;
  resultEl.innerHTML = `
    <div>
      <p><strong>${amount.toFixed(2)} ${sourceCurrency}</strong> =</p>
      <p style="font-size: 1.6rem; color: #0066cc;">${etbAmount.toFixed(2)} ETB</p>
      <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">Rate: 1 ${sourceCurrency} = ${rateInEtb.toFixed(4)} ETB</p>
    </div>
  `;
}

function renderWatchlist() {
  if (state.watchlist.length === 0) {
    watchlistEl.innerHTML = `<li class="empty-watchlist">No currencies added to your watchlist yet.</li>`;
    return;
  }

  const etbRateInUsd = state.rates['ETB'];

  const itemsHtml = state.watchlist.map(code => {
    const foreignRateInUsd = state.rates[code];
    let rateDisplay = 'Rate unavailable';

    if (foreignRateInUsd && etbRateInUsd) {
      // Calculate 1 Foreign Currency unit in ETB
      const rateInEtb = etbRateInUsd / foreignRateInUsd;
      rateDisplay = `1 ${code} = ${rateInEtb.toFixed(2)} ETB`;
    }

    return `
      <li class="watchlist-item" data-code="${code}">
        <div>
          <strong>${code}</strong>
          <div style="font-size: 0.85rem; color: #555;">${rateDisplay}</div>
        </div>
        <button type="button" class="delete-btn" data-action="delete" data-code="${code}">Remove</button>
      </li>
    `;
  }).join('');

  watchlistEl.innerHTML = itemsHtml;
}

// API Fetch
async function fetchRates() {
  setStatus('loading', 'Fetching latest exchange rates...');

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('API reported an error fetching data.');
    }

    state.rates = data.conversion_rates || {};
    setStatus('success', 'Exchange rates updated successfully.');

    // Enable inputs
    currencySelect.disabled = false;
    convertBtn.disabled = false;
    addWatchlistBtn.disabled = false;

    // Render updated interface
    renderDropdown();
    renderWatchlist();

    // Auto-recalculate conversion if user had saved inputs
    if (state.amount && state.sourceCurrency) {
      calculateConversion();
    }

  } catch (error) {
    console.error('Fetch error:', error);
    setStatus('error', `Failed to load exchange rates: ${error.message}`);
  }
}

// Logic & Event Handlers
function calculateConversion() {
  const amountVal = parseFloat(state.amount);
  const source = state.sourceCurrency;

  if (isNaN(amountVal) || amountVal <= 0) {
    setStatus('error', 'Please enter a valid positive number for the amount.');
    return;
  }

  if (!source || !state.rates[source] || !state.rates['ETB']) {
    setStatus('error', 'Please select a valid source currency.');
    return;
  }

  // Cross-rate calculation: convert foreign currency to ETB
  const sourceRateInUsd = state.rates[source];
  const etbRateInUsd = state.rates['ETB'];
  const rateInEtb = etbRateInUsd / sourceRateInUsd;
  const etbAmount = amountVal * rateInEtb;

  state.conversionResult = {
    amount: amountVal,
    sourceCurrency: source,
    etbAmount: etbAmount,
    rateInEtb: rateInEtb,
  };

  setStatus('success', 'Conversion calculated.');
  renderResult();
  saveStateToStorage();
}

// Handle Form Submission (Conversion)
formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  state.amount = amountInput.value;
  state.sourceCurrency = currencySelect.value;
  calculateConversion();
});

// Update state on currency dropdown change
currencySelect.addEventListener('change', (e) => {
  state.sourceCurrency = e.target.value;
  saveStateToStorage();
});

// Add to Watchlist
addWatchlistBtn.addEventListener('click', () => {
  const selectedCurrency = currencySelect.value;

  if (!selectedCurrency) {
    setStatus('error', 'Please select a currency first to add it to your watchlist.');
    return;
  }

  if (state.watchlist.includes(selectedCurrency)) {
    setStatus('error', `${selectedCurrency} is already in your watchlist.`);
    return;
  }

  state.watchlist.push(selectedCurrency);
  saveStateToStorage();
  renderWatchlist();
  setStatus('success', `Added ${selectedCurrency} to watchlist.`);
});

// Event Delegation for Watchlist Deletion
watchlistEl.addEventListener('click', (e) => {
  const target = e.target;

  if (target.dataset.action === 'delete') {
    const currencyToRemove = target.dataset.code;
    state.watchlist = state.watchlist.filter(code => code !== currencyToRemove);
    
    saveStateToStorage();
    renderWatchlist();
    setStatus('success', `Removed ${currencyToRemove} from watchlist.`);
  }
});

// Initialization
function init() {
  loadStateFromStorage();

  // Pre-fill inputs from state if available
  if (state.amount) {
    amountInput.value = state.amount;
  }

  renderResult();
  renderWatchlist();
  fetchRates();
}

// Start application
init();