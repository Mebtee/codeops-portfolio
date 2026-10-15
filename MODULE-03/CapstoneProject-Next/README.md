# Mesob House — capstone migrated to Next.js

The Module 03 capstone (a Vite + React Router SPA for a fictional Addis Ababa
restaurant) migrated to the **Next.js App Router**. Every screen, store, the
menu data layer, the cart ledger maths, and the validated checkout were carried
over; only the routing seam, the styling entry point, and the render boundary
moved.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (route table below)
npm run start    # serve the production build
```

Stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **Zustand 5** +
**React Hook Form** + **Zod 3**.

See [`STRATEGY.md`](./STRATEGY.md) for every route's strategy and
[`BOUNDARY.md`](./BOUNDARY.md) for the server/client boundary map.

---

## Routes

| Path | Source page | Strategy |
| ---- | ----------- | -------- |
| `/` | `Signup` (client island) | Static shell |
| `/signup` | `Signup` | Static shell |
| `/login` | `Login` (client island) | Static shell |
| `/menu` | `FullMenu` (client island) | Static shell, client-fetched data |
| `/menu/[id]` | `RoyalDish` (client island) | **SSG** — 20 pages via `generateStaticParams` |
| `/future` | `TodaySpecial` (one client island) | Static |
| `/orderCart` | `CurrentOrderCart` (client island) | Static shell |
| `/delivery` | `CheckoutDelivery` (client island) | Static shell |
| `/Delibery` | — | `307` redirect → `/delivery` |
| everything else | `NotFound404` | `app/not-found.jsx` |

### What changed in the migration

| Vite / React Router | Next.js |
| ------------------- | ------- |
| `App.jsx` `<Routes>` | one `app/**/page.jsx` per URL |
| `Layout.jsx` `<Outlet />` | `app/layout.jsx` `{children}` |
| `React.lazy` + `<Suspense>` | automatic per-route code splitting |
| `<Route path="*">` | `app/not-found.jsx` |
| `<Navigate to="/delivery" replace />` | `next.config.mjs` `redirects()` |
| `<Link to>` | `next/link` `href` |
| `useNavigate()` | `useRouter().push()` |
| `useParams()` | `useParams()` (`next/navigation`) |
| `ErrorBoundary` class | `app/error.jsx` |
| `import './X.css'` per component | imported once from `app/layout.jsx` |
| `localStorage` rehydrate on load | `skipHydration` + `Providers` rehydrates after mount |

---

## Production build output

```text
> mesob-house@1.0.0 build
> next build

▲ Next.js (Turbopack)
✓ Compiled successfully
✓ Generating static pages using 11 workers (29/29)

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /delivery
├ ○ /future
├ ○ /login
├ ○ /menu
├   /menu/[id]
│ ├ ● /menu/doro-wat
│ ├ ● /menu/siga-wat
│ ├ ● /menu/beg-alicha-wat
│ └ ● [+17 more paths]
├ ○ /orderCart
└ ○ /signup

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

`○` static, `●` SSG via `generateStaticParams`. This matches the route table in
`STRATEGY.md`.

---

## Reachability & failure checks (production build)

`JavaScript disabled` = `curl`, which never runs client JS.

| Probe | Result |
| ----- | ------ |
| `/` `/signup` `/login` `/menu` `/menu/doro-wat` `/future` `/orderCart` `/delivery` | `200` |
| `/Delibery` | `307 → /delivery` |
| `/does-not-exist` | `404` (custom **TABLE NOT SET** page) |
| JS off · `/` | HTML already contains "Create Your Mesob House Account" |
| JS off · `/menu` | HTML already contains dish cards (e.g. "Shiro Tegamino") |
| JS off · `/menu/doro-wat` | HTML contains the dish name and description (page passes the SSG dish as `initialDish`) |
| JS off · `/future` | HTML contains "Every Day at 4:00 PM" |
| JS off · `/orderCart` | HTML contains "Your Gursha Basket" |
| JS off · `/delivery` | HTML contains the empty-basket guard |
| JS off · `/login` | HTML contains "Welcome to the Mesob Table" |
| JS off · unknown route | HTML contains "TABLE NOT SET" |

Because every page is a server component that renders a client island, the
document shell and static copy are present without JavaScript; only the
interactive behaviour (search, add-to-cart, persisted basket, forms) needs
hydration.

---

## Layout

```text
CapstoneProject-Next/
├── STRATEGY.md / BOUNDARY.md / README.md
├── next.config.mjs                 # /Delibery -> /delivery redirect
├── public/
│   ├── menu.json  specials.json     # the capstone "API"
│   ├── food.jpg   favicon.svg       # shared dish photo + icons
│   └── icons.svg
└── src/
    ├── app/
    │   ├── layout.jsx               # shell + all global CSS + Providers
    │   ├── globals.css              # index.css + App.css + Layout.css
    │   ├── providers.jsx            # zustand rehydrate-after-mount
    │   ├── error.jsx  not-found.jsx
    │   ├── page.jsx  signup/page.jsx  login/page.jsx
    │   ├── menu/page.jsx  menu/[id]/page.jsx
    │   ├── future/page.jsx  orderCart/page.jsx  delivery/page.jsx
    ├── api.js                       # useMenuData() fetch hook (unchanged)
    ├── lib/dishes-server.js         # fs read of menu.json for SSG
    ├── data/dishes.js  data/footerLinks.js
    ├── Store/useCartStore.js  Store/useAuthStore.js
    └── Component/                   # Header, Footer, FullMenu, RoyalDish,
                                     # CurrentOrderCart, CheckoutDelivery,
                                     # Login, Signup, NotFound404, TodaySpecial,
                                     # UI/{ImgBox,icons}
```
