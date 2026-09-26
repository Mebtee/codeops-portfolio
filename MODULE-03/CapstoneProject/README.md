# Mesob House

**Capstone Project — Module 03 (React)**

A front-end ordering experience for a fictional Ethiopian restaurant in Addis Ababa. Guests browse a
fetch-driven menu, customise a dish, manage a persistent cart, and complete a validated delivery and
payment checkout. Built as the Module 03 capstone to demonstrate routing, data fetching, global state,
form validation, and code-splitting in a single React application.

> The UI text, branding, menu data, and payment flows are demo content. There is no backend — see
> [Demo Limitations](#demo-limitations).

---

## Features

- **Data-Driven Menu** — dishes load from `public/menu.json` and `public/specials.json` at runtime
  through a custom fetch hook, with a normalising layer and an automatic offline fallback.
- **Live Search & Category Filters** — the full menu is searchable by name and filterable across six
  categories, each chip showing a live item count.
- **Customisable Dish Detail** — `/menu/:id` offers spice level, injera base, and up to two side
  accents; priced extras are computed and carried into the cart as a single line item.
- **Persistent Cart** — a Zustand store persisted to `localStorage`, keyed by dish *and* option string so
  the same dish with different options stays on separate lines.
- **Full Price Ledger** — subtotal, packaging fee, tiered delivery, 15% VAT, and a coupon discount are
  all derived in one selector rather than recomputed in each component.
- **Coupon Codes** — `GURSHA2025` takes ETB 200 off; invalid codes return a friendly inline error.
- **Free-Delivery Progress** — the cart tracks a live "add X more to unlock free Bole-zone delivery" bar.
- **Validated Checkout** — React Hook Form + Zod, including cross-field rules that only require a
  dispatch time when "schedule" is selected and a Telebirr number when that payment method is chosen.
- **Multiple Payment Methods** — Telebirr (with a simulated verification step), CBE Birr, cash/POS, and
  Amole/Awash.
- **Code-Split Routing** — every page is `React.lazy`-loaded behind a shared `Suspense` boundary, so
  most pages ship as their own chunk on first visit instead of in the initial bundle. (Two pages are
  currently excluded from this — see [Known Code Issues](#known-code-issues).)
- **Error Boundary** — a class component catches render failures anywhere in the tree and offers a
  reload instead of a blank page.
- **Demo Auth** — login and signup forms persist a session so the header can swap between guest and
  member states.

---

## Tech Stack

| Concern | Choice |
| --- | --- |
| UI library | React 19.2 |
| Build tool / dev server | Vite 8.3 |
| Routing | react-router-dom 7.18 |
| Global state | Zustand 5.0 with the `persist` middleware |
| Forms | react-hook-form 7.88 |
| Validation | Zod 3.25 via `@hookform/resolvers` |
| Linting | Oxlint 1.81 (`react/rules-of-hooks` as an error) |
| Styling | Plain CSS — one stylesheet per component, no CSS framework |

There is no TypeScript, no test runner, and no CSS preprocessor in this project.

---

## Getting Started

```bash
npm install
npm run dev
```

Vite prints a local URL (by default `http://localhost:5173`). All other commands:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server with hot module replacement |
| `npm run build` | Produce a production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally to verify the production output |
| `npm run lint` | Run Oxlint over the project |

The production build is a static site, so any static host works. Because routing uses real URL paths
(e.g. `/orderCart`), the host must rewrite unknown paths to `index.html` for deep links and the 404
route to work on refresh.

---

## Project Structure

```text
CapstoneProject/
├── index.html                    # Vite entry; mounts /src/instrance.jsx
├── vite.config.js                # React plugin only
├── .oxlintrc.json                # Oxlint config
├── public/
│   ├── menu.json                 # 20 dishes served as the "API"
│   ├── specials.json             # 5 dish slugs featured as today's specials
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── instrance.jsx             # React root (createRoot + StrictMode)
    ├── App.jsx                   # Router, lazy routes, Suspense, ErrorBoundary
    ├── Layout.jsx                # Shared shell: Header + Outlet + Footer
    ├── ErrorBoundary.jsx         # Top-level render error catch
    ├── api.js                    # useMenuData() fetch hook, normaliser, cache
    ├── data/
    │   ├── dishes.js             # CATEGORIES, fmt() currency helper, offline DISHES
    │   └── footerLinks.js        # Footer brand, columns, and legal links
    ├── assets/
    │   └── food.jpg              # Shared dish photo used by every ImgBox
    ├── context/
    │   └── storage.js            # try/catch localStorage read/write helpers
    ├── Store/
    │   ├── useCartStore.js       # Cart state, actions, and derived totals
    │   └── useAuthStore.js       # Demo session state
    └── Component/
        ├── TodaySpecial/         # Landing page; Container/Section4–6 compose it
        ├── FullMenu/             # Searchable, filterable menu grid
        ├── RoyalDish/            # Single-dish customiser
        ├── CurrentOrderCart/     # Basket + price ledger
        ├── CheckoutDelivery/     # Address, timing, payment, confirmation
        ├── Login/                # Sign-in form
        ├── Signup/               # Registration form
        ├── Header/               # Logo, Nav, cart summary, account links
        ├── Footer/               # Brand, link columns, lower legal bar
        ├── NotFound404/          # 404 page plus house-favourite shortcuts
        ├── UI/ImgBox.jsx         # Accessible photo placeholder tile
        ├── CheckoutForm.jsx      # Legacy/unused
        ├── DishList.jsx          # Legacy/unused
        └── Navbar.jsx            # Legacy/unused
```

### Routes

| Path | Page | Notes |
| --- | --- | --- |
| `/` | `TodaySpecial` | Landing page; also the `index` route |
| `/future` | `TodaySpecial` | "Featured Dish" nav target, currently aliases the landing page |
| `/menu` | `FullMenu` | Search, category filters, add-to-cart |
| `/menu/:id` | `RoyalDish` | Dish detail by slug, e.g. `/menu/doro-wat` |
| `/orderCart` | `CurrentOrderCart` | Quantity steppers, coupon, kitchen note |
| `/delivery` | `CheckoutDelivery` | Three-step checkout ending in confirmation |
| `/Delibery` | redirect → `/delivery` | Keeps the misspelled nav link working |
| `/login` | `Login` | Phone + password, demo sign-in |
| `/signup` | `Signup` | Registration with password confirmation |
| `*` | `NotFound404` | Catch-all with recovery links |

---

## Data Flow

`src/api.js` is the single boundary between the app and its menu data.

1. `useMenuData()` calls `loadMenuData()`, which fetches `/menu.json` and `/specials.json` in parallel.
2. `normalize()` maps each JSON record onto the single shape the components consume — `id`, `name`,
   `price`, `cat`, `tag`, `tagline`, `spice`, `desc`, `servings`, `isFasting`, `amName` — so the raw
   API-style fields (`slug`, `nameEn`, `nameAm`, `priceETB`, `spiceLevel`, `description`) are translated
   in exactly one place.
3. `CAT_MAP` folds the API's free-text category strings onto the six UI category keys using a substring
   match, defaulting to `wat` when nothing matches.
4. Specials arrive as an array of slugs, which are resolved back to full dish objects.
5. The result is cached in a module-level variable, so repeat mounts do not re-fetch. The hook guards
   against setting state after unmount.
6. If either request fails, `loadMenuData()` catches and falls back to the in-code `DISHES` array from
   `src/data/dishes.js` and reports `fromApi: false`, so the app still renders offline.

`findDish(id)` is the synchronous lookup used by the cart, and also falls back to `DISHES` — which is
what lets the cart resolve dishes before the fetch resolves, and lets the landing page add
`injera-3` directly.

---

## State Management

Two persisted Zustand stores, both reading and writing `localStorage` under a fixed key.

### Cart — `mesob-cart` (`Store/useCartStore.js`)

Actions: `addItem`, `addToCart`, `updateQty`, `removeItem`, `removeFromCart`, `clearCart`,
`applyCoupon`, `setOrderNote`.

- Lines are identified by `` `${id}|${option}` `` rather than by id alone, so Doro Wat with *Fiery Awaze
  · 100% Pure Teff* and Doro Wat with *Traditional Heat* are two independent lines.
- `selectCart` derives every number the UI displays in one place, so the cart page and the checkout
  summary can never disagree:

  | Constant | Value |
  | --- | --- |
  | `PACKAGING_FEE` | ETB 60 |
  | `DELIVERY_FEE` | ETB 80 |
  | `FREE_DELIVERY_MIN` | ETB 1200 |
  | `VAT_RATE` | 15% |
  | `COUPON_CODE` / `COUPON_DISCOUNT` | `GURSHA2025` / ETB 200 |

- The `useCart()` hook spreads the store actions and the derived totals together, which is what lets a
  component destructure `addItem` and `subtotal` in a single call. Components that only read totals
  should prefer `useCartStore(useShallow(selectCart))` to avoid re-rendering on unrelated state changes.

### Auth — `mesob-auth` (`Store/useAuthStore.js`)

`login`, `logout`, plus `user` and `isAuthenticated`. The header reads it to swap guest links for the
signed-in member name and a log-out button. `src/context/storage.js` holds the same try/catch
localStorage pattern for any non-Zustand persistence.

---

## Notable Implementation Details

- **Route-level code splitting** — `App.jsx` lazy-loads all eight page components and renders them
  behind one `Suspense` fallback. A production build emits a separate chunk per page for six of them.
- **Option pricing** — `RoyalDish` adds surcharges for 100% teff injera and an extra braised egg, then
  passes both a human-readable `option` string and a numeric `optionPrice` into `addItem`, so the cart
  can display the choice *and* re-derive the line total.
- **Conditional validation** — the checkout Zod schema uses `superRefine` to require a dispatch time
  only for scheduled orders and a valid Telebirr number only for Telebirr payments, instead of
  duplicating conditionals in JSX.
- **A guard for direct checkout** — `CheckoutDelivery` renders an empty-basket state if it is reached
  without items, so the URL cannot bypass the cart.
- **One shared dish photo** — `ImgBox` is the single seam for all nine image slots (menu cards, dish
  gallery, cart, checkout summary, 404 favourites). It renders the shared `src/assets/food.jpg` with the
  caller's `label` as `alt` text, so every dish is a placeholder-free `<img>` and swapping in real
  per-dish photography later means editing one file.
- **Currency formatting** — `fmt()` in `src/data/dishes.js` is the single place that renders ETB.

---

## Demo Limitations

This is a front-end capstone with no server, so the following are simulated in the browser:

- **Login and signup** accept any input that passes validation and store the session locally. There is
  no password check, session expiry, or user database.
- **Telebirr verification** is a fixed 900 ms delay before the button reports "Verified".
- **Order confirmation** is a 700 ms delay followed by a client-side order number derived from
  `Date.now()`. No payment is processed and no message is sent.
- **The order note and delivery address** are never transmitted anywhere.
- **Dish photography** is a single shared image (`src/assets/food.jpg`) reused for every dish, not
  per-dish photography. It is also a 662 kB / 1408x768 JPEG served for slots as small as 54px, so the
  payload is worth compressing or adding `srcset` variants for.
- **Search** matches dish names only, not descriptions or ingredients.
- **`/future`** is wired to the landing page; the "Featured Dish" nav item is not its own page yet.

### Known Code Issues

These were confirmed by running `npm run lint` and `npm run build` against the project.

- **`Store/` vs `store/`** — the directory is `src/Store/`, but every import uses `../store/...`. This
  resolves on case-insensitive filesystems such as Windows and macOS, but will fail on a
  case-sensitive Linux CI or build host. Either rename the directory to `store/` or update the imports.
- **Code splitting is partially defeated** — `Header/CartForm/CartForm.jsx` statically imports `Login`
  and `Signup` without using them, so Vite reports `INEFFECTIVE_DYNAMIC_IMPORT` for both and pulls them
  back into the main entry chunk. Removing those two unused imports restores the lazy split.
- **Dead components referencing removed APIs** — `Component/CheckoutForm.jsx`, `Component/DishList.jsx`,
  and `Component/Navbar.jsx` are not routed anywhere and still reach for store APIs that no longer
  exist (`state.cart`, `state.addToCart`). `Component/TodaySpecial/Container/Container.jsx` references an
  undefined `Contaner1` component. None of these are imported, so the build still passes, but they are
  dead code that will break the moment anything starts importing them.
- **Constant-truthiness bug in the cart summary** — `CartForm.jsx` guards its markup with
  `{{ count } && ...` and `{{ subtotal } && ...`. Those are object literals, which are always truthy, so
  the guard never does anything. Oxlint flags both as `no-constant-binary-expression`.
- **Leftover debug logging** — `RoyalDish.jsx` logs the resolved dish on every load, and its `useEffect`
  has an incomplete dependency array (`exhaustive-deps` warning).
- **Unused state and imports** — Oxlint reports unused variables in `Header.jsx`, `FullMenu.jsx`,
  `RoyalDish.jsx`, and `CheckoutForm.jsx`.
- **Hardcoded defaults** — the checkout form ships with a filled-in sample address, phone, and email as
  its default values, which makes the form look pre-submitted on first open.

---

## Module 03 Learning Coverage

- Component composition, prop drilling avoidance, and deeply nested component trees
- React Router with nested layouts, dynamic params, and redirects
- Code splitting with `React.lazy` and `Suspense`
- Global state with Zustand, derived selectors, and the `persist` middleware
- `useEffect` data fetching, caching, unmount guards, and error fallbacks
- Form state management and schema validation with React Hook Form and Zod
- Error boundaries and loading/empty/error UI states
- Component and CSS organization conventions in a multi-page SPA
