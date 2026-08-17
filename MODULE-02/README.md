# Birr Watch

A lightweight, responsive web application that fetches real-time foreign exchange rates, performs currency conversions into Ethiopian Birr (ETB), and allows users to manage a custom currency watchlist with full local persistence.

---

## Features

- **Live Rate Integration**: Dynamically fetches up-to-date conversion rates via the ExchangeRate-API.
- **Foreign Currency to ETB Conversion**: Converts any selected foreign currency directly into Ethiopian Birr (ETB) using cross-rate calculation logic.
- **Personal Watchlist**: Add or remove currencies from a personal watchlist with dynamic UI rendering.
- **State Persistence**: Uses browser `localStorage` to save user selections, inputs, and watchlist items across page reloads.
- **Interactive UI Feedback**: Features dedicated status indicators for loading, success, and error handling.
- **Event Delegation**: Optimized DOM event management for handling dynamic watchlist deletions.

---

## Project Structure

```text
project-folder/
├── index.html     # Semantic HTML markup
├── styles.css     # UI layout, typography, and status styling
├── app.js         # Core application logic, API handling, and storage
└── README.md      # Project documentation